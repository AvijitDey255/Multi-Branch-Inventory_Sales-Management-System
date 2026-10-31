package com.Multi_Branch_application.backend.dto;
import lombok.Data;
@Data
public class SignupRequest {
    private String username;
    private String fullname;
    private String email;
    private String password;
    private String role; // Optional, defaults to user
}
