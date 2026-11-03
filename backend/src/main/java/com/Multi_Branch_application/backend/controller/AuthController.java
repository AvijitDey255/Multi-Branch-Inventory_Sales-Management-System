package com.Multi_Branch_application.backend.controller;

import com.Multi_Branch_application.backend.dto.CustomerLoginRequest;
import com.Multi_Branch_application.backend.dto.CustomerOtpVerifyRequest;
import com.Multi_Branch_application.backend.dto.LoginRequest;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.dto.OtpVerifyRequest;
import com.Multi_Branch_application.backend.dto.SignupRequest;
import com.Multi_Branch_application.backend.service.AuthService;
import com.Multi_Branch_application.backend.service.CustomerServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    AuthService authService;

    @Autowired
    CustomerServices customerServices;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        if (loginRequest.getUsername() == null || loginRequest.getUsername().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Username or email is required"));
        }

        if (loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Password is required"));
        }

        return authService.authenticateUser(loginRequest);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        return authService.logoutUser();
    }

    @PostMapping("/customer/login")
    public ResponseEntity<?> customerLogin(@RequestBody CustomerLoginRequest loginRequest) {
        return customerServices.sendOtp(loginRequest);
    }

    @PostMapping("/customer/verify-otp")
    public ResponseEntity<?> customerVerifyOtp(@RequestBody CustomerOtpVerifyRequest verifyRequest) {
        return customerServices.verifyOtp(verifyRequest);
    }



}
