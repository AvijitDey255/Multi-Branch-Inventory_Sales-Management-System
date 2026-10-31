package com.Multi_Branch_application.backend.dto;

import com.Multi_Branch_application.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String username;
    private String fullname;
    private String email;
    private String role;
    private String message;

    public UserResponse(Long id, String username, String fullname, String email, String role) {
        this.id = id;
        this.username = username;
        this.fullname = fullname;
        this.email = email;
        this.role = role != null && role.startsWith("ROLE_") ? role.substring(5) : role;
        this.message = "name : " + (username != null ? username : "");
    }

    public UserResponse(Long id, String username, String name, String email, Role role) {
        this.id = id;
        this.username = username;
        this.fullname = name;
        this.email = email;
        this.role = role != null ? role.name() : null;
        this.message = "name : " + (username != null ? username : "");
    }

    public String getName() {
        return fullname != null && !fullname.trim().isEmpty() ? fullname : username;
    }
}
