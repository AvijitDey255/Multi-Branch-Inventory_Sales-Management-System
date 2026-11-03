package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.CustomerCreateRequestDTO;
import com.Multi_Branch_application.backend.dto.CustomerLoginRequest;
import com.Multi_Branch_application.backend.dto.CustomerOtpVerifyRequest;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.entity.Customer;
import com.Multi_Branch_application.backend.repository.CustomerRepository;
import com.Multi_Branch_application.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class CustomerServices {

    @Autowired
    CustomerRepository customerRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtUtils jwtUtils;

    public ResponseEntity<?> createCustomer(CustomerCreateRequestDTO requestDTO) {
        Optional<Customer> existCustomer = customerRepository.findByMobileOrEmail(requestDTO.getMobile(), requestDTO.getEmail());

        if (!existCustomer.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("That Email or Mobile number is already exist"));
        }

        Customer customer = new Customer();
        customer.setName(requestDTO.getName());
        customer.setEmail(requestDTO.getEmail());
        customer.setMobile(requestDTO.getMobile());
        customer.setActive(true);

        customerRepository.save(customer);

        return ResponseEntity.ok(new MessageResponse("Customer created successfully"));
    }

    public ResponseEntity<?> sendOtp(CustomerLoginRequest request) {
        String emailOrMobile = request != null ? request.getIdentifier() : null;
        return sendOtp(emailOrMobile);
    }

    public ResponseEntity<?> sendOtp(String emailOrMobile) {
        if (emailOrMobile == null || emailOrMobile.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email or mobile number is required"));
        }

        String query = emailOrMobile.trim();
        // Check if customer exists by email or mobile number
        Optional<Customer> customerOpt = customerRepository.findByMobileOrEmail(query, query);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("Customer not found with: " + query));
        }

        Customer customer = customerOpt.get();
        if (Boolean.FALSE.equals(customer.getActive())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Customer account is deactivated"));
        }

        // Generate 6-digit OTP (e.g. 100000 - 999999)
        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        customer.setOtp(otp);
        customer.setOtpExpiry(LocalDateTime.now().plusMinutes(5)); // Valid for 5 minutes
        customerRepository.save(customer);

        // Send OTP to customer's email
        String emailSubject = "Your Login OTP";
        String emailBody = "Hello " + (customer.getName() != null ? customer.getName() : "Customer") + ",\n\n"
                + "Your 6-digit OTP for login is: " + otp + "\n"
                + "This OTP is valid for 5 minutes. Do not share it with anyone.";

        emailService.sendEmail(customer.getEmail(), emailSubject, emailBody);

        return ResponseEntity.ok(new MessageResponse("OTP sent successfully to " + maskEmail(customer.getEmail())));
    }

    public ResponseEntity<?> verifyOtp(CustomerOtpVerifyRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Request body is required"));
        }
        return verifyOtp(request.getIdentifier(), request.getOtp());
    }

    public ResponseEntity<?> verifyOtp(String emailOrMobile, String otp) {
        if (emailOrMobile == null || emailOrMobile.isBlank() || otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email/Mobile and OTP are required"));
        }

        String query = emailOrMobile.trim();
        Optional<Customer> customerOpt = customerRepository.findByMobileOrEmail(query, query);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("Customer not found"));
        }

        Customer customer = customerOpt.get();

        // Check if OTP matches
        if (customer.getOtp() == null || !customer.getOtp().equals(otp.trim())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid OTP"));
        }

        // Check if OTP is expired
        if (customer.getOtpExpiry() == null || customer.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(new MessageResponse("OTP has expired. Please request a new one"));
        }

        // Clear OTP after successful verification to prevent replay
        customer.setOtp(null);
        customer.setOtpExpiry(null);
        customerRepository.save(customer);

        // Generate JWT token (using customer email as subject)
        String jwtToken = jwtUtils.generateTokenFromUsername(customer.getEmail());
        ResponseCookie jwtCookie = jwtUtils.generateCookieFromToken(jwtToken);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("message", "Login successful");
        responseData.put("token", jwtToken);
        responseData.put("customerId", customer.getId());
        responseData.put("email", customer.getEmail());
        responseData.put("mobile", customer.getMobile());
        responseData.put("name", customer.getName());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .body(responseData);
    }

    // Helper to mask email in response (e.g., j***e@gmail.com)
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        int atIndex = email.indexOf('@');
        if (atIndex <= 2) return "***" + email.substring(atIndex);
        return email.charAt(0) + "***" + email.charAt(atIndex - 1) + email.substring(atIndex);
    }
}
