package com.Multi_Branch_application.backend.controller;

import com.Multi_Branch_application.backend.entity.Role;
import com.Multi_Branch_application.backend.entity.User;
import com.Multi_Branch_application.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/demo-seed")
@RequiredArgsConstructor
public class DemoSeedController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/user")
    public ResponseEntity<?> createDemoUserData(@RequestBody User userInfo) {
        User user = userRepository.findByUsername(userInfo.getUsername())
                .orElseGet(() -> userRepository.findByEmail(userInfo.getEmail())
                        .orElseGet(User::new));

        user.setName(userInfo.getName());
        user.setUsername(userInfo.getUsername());
        user.setEmail(userInfo.getEmail());
        user.setPassword(passwordEncoder.encode(userInfo.getPassword()));
        user.setRole(userInfo.getRole());
        user.setActive(true);

        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message", user.getName() +"'s data is created successfully",
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                )
        );
    }
}