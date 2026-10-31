package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.*;
import com.Multi_Branch_application.backend.entity.Role;
import com.Multi_Branch_application.backend.entity.User;
import com.Multi_Branch_application.backend.repository.UserRepository;
import com.Multi_Branch_application.backend.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    public ResponseEntity<?> authenticateUser(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId()).get();

//            if (!user.getEmailVerify()) {
//                String otp = String.format("%06d", new Random().nextInt(999999));
//                user.setOtp(otp);
//                user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
//                userRepository.save(user);
//
//                emailService.sendEmail(user.getEmail(), "Your Verification OTP", "Your OTP is: " + otp);
//                return ResponseEntity.status(403).body(new MessageResponse("email not verified, otp sent"));
//            }

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(authentication);

            String role = user.getRole() != null ? user.getRole().name() : "";

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .body(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getFullname(),
                    userDetails.getEmail(),
                    role));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(new MessageResponse("invalid user"));
        }
    }

    public ResponseEntity<?> logoutUser() {
        ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new MessageResponse("You've been signed out!"));
    }

//    public ResponseEntity<?> registerUser(SignupRequest signUpRequest) {
//        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
//            return ResponseEntity
//                    .badRequest()
//                    .body(new MessageResponse("user already exist"));
//        }
//
//        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
//            return ResponseEntity
//                    .badRequest()
//                    .body(new MessageResponse("user already exist"));
//        }
//
//        User user = new User();
//        user.setUsername(signUpRequest.getUsername());
//        user.setFullname(signUpRequest.getFullname());
//        user.setEmail(signUpRequest.getEmail());
//        user.setPassword(encoder.encode(signUpRequest.getPassword()));
//
//        user.setActivate(true);
//        user.setEmailVerify(false);
//
//        String otp = String.format("%06d", new Random().nextInt(999999));
//        user.setOtp(otp);
//        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
//
//        Set<Role> roles = new HashSet<>();
//        String strRole = signUpRequest.getRole();
//
//        if (strRole == null) {
//            roles.add(Role.ROLE_USER);
//        } else {
//            if ("admin".equalsIgnoreCase(strRole)) {
//                roles.add(Role.ROLE_ADMIN);
//            } else {
//                roles.add(Role.ROLE_USER);
//            }
//        }
//
//        user.setRoles(roles);
//        userRepository.save(user);
//
//        emailService.sendEmail(user.getEmail(), "Welcome! Verify your email", "Your OTP is: " + otp);
//
//        return ResponseEntity.ok(new MessageResponse("User registered successfully! Please verify your email."));
//    }
//
//    public ResponseEntity<?> verifyOtp(OtpVerifyRequest request) {
//        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
//        if (!userOpt.isPresent()) {
//            return ResponseEntity.badRequest().body(new MessageResponse("invalid user"));
//        }
//        User user = userOpt.get();
//
//        if (user.getEmailVerify()) {
//            return ResponseEntity.badRequest().body(new MessageResponse("Email is already verified"));
//        }
//
//        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
//            return ResponseEntity.badRequest().body(new MessageResponse("Invalid OTP"));
//        }
//
//        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
//            return ResponseEntity.badRequest().body(new MessageResponse("OTP expired"));
//        }
//
//        user.setEmailVerify(true);
//        user.setOtp(null);
//        user.setOtpExpiry(null);
//        userRepository.save(user);
//
//        return ResponseEntity.ok(new MessageResponse("Email verified successfully! You can now login."));
//    }
}
