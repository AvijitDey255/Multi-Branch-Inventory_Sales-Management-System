package com.Multi_Branch_application.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOtpVerifyRequest {
    private String emailOrMobile;
    private String email;
    private String mobile;
    private String otp;

    public String getIdentifier() {
        if (emailOrMobile != null && !emailOrMobile.isBlank()) {
            return emailOrMobile.trim();
        }
        if (email != null && !email.isBlank()) {
            return email.trim();
        }
        if (mobile != null && !mobile.isBlank()) {
            return mobile.trim();
        }
        return null;
    }
}

