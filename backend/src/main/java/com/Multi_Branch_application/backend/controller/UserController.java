package com.Multi_Branch_application.backend.controller;

import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.dto.UserDetailsImpl;

import com.Multi_Branch_application.backend.dto.UserResponse;
import com.Multi_Branch_application.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping({"/me", "/profile"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
                user = (UserDetailsImpl) auth.getPrincipal();
            }
        }

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error: User is not authenticated."));
        }

        return userService.getUserProfile(user);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }


//    @GetMapping("/all")
//    public ResponseEntity<?> getAllUsers(Authentication authentication) {
//
//        boolean isAdmin = authentication.getAuthorities()
//                .stream()
//                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
//
//        if (!isAdmin) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN)
//                    .body(new MessageResponse("Access denied. Only ADMIN can access all users."));
//        }
//
//        return ResponseEntity.ok(userService.getAllUsers());
//    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
