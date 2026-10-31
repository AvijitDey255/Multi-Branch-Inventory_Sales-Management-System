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

    @GetMapping
    public ResponseEntity<?> createDemoData() {
        User user = userRepository.findByUsername("subho25")
                .orElseGet(() -> userRepository.findByEmail("subho@gmail.com")
                        .orElseGet(User::new));

        user.setName("subhojeet dey");
        user.setUsername("subho25");
        user.setEmail("subho@gmail.com");
        user.setPassword(passwordEncoder.encode("123456"));
        user.setRole(Role.BRANCH_MANAGER);
        user.setActive(true);

        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message", "Demo data created successfully",
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole().name()
                )
        );
    }
}