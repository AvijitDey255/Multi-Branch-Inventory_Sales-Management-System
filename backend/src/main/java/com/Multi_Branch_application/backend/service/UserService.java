package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.dto.UserDetailsImpl;
import com.Multi_Branch_application.backend.dto.UserResponse;
import com.Multi_Branch_application.backend.entity.User;
import com.Multi_Branch_application.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public ResponseEntity<?> getUserProfile(UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error: User is not authenticated."));
        }

        String role = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .map(r -> r.startsWith("ROLE_") ? r.substring(5) : r)
                .orElse("");

        UserResponse userResponse = new UserResponse(
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFullname(),
                userDetails.getEmail(),
                role
        );

        return ResponseEntity.ok(userResponse);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public ResponseEntity<?> getUserById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Error: User not found with id: " + id));
        }

        return ResponseEntity.ok(mapToUserResponse(userOpt.get()));
    }

    private UserResponse mapToUserResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }


}
