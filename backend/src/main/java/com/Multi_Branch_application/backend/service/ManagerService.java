package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.ManagerRequestDTO;
import com.Multi_Branch_application.backend.dto.ManagerResponseDTO;
import com.Multi_Branch_application.backend.dto.ManagerUpdateDTO;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.entity.Branch;
import com.Multi_Branch_application.backend.entity.Role;
import com.Multi_Branch_application.backend.entity.User;
import com.Multi_Branch_application.backend.repository.BranchRepository;
import com.Multi_Branch_application.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ManagerService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Transactional
    public ResponseEntity<?> createManager(ManagerRequestDTO requestDTO) {
        if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Manager name is required"));
        }
        if (requestDTO.getUsername() == null || requestDTO.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Username is required"));
        }
        if (requestDTO.getEmail() == null || requestDTO.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required"));
        }
        if (requestDTO.getPassword() == null || requestDTO.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Password is required"));
        }

        if (userRepository.existsByUsername(requestDTO.getUsername().trim())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Username is already taken"));
        }
        if (userRepository.existsByEmail(requestDTO.getEmail().trim())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is already registered"));
        }

        User manager = new User();
        manager.setName(requestDTO.getName().trim());
        manager.setUsername(requestDTO.getUsername().trim());
        manager.setEmail(requestDTO.getEmail().trim());
        manager.setPassword(encoder.encode(requestDTO.getPassword().trim()));
        manager.setRole(Role.BRANCH_MANAGER);
        manager.setActive(true);

        Branch assignedBranch = null;
        if (requestDTO.getBranchId() != null) {
            Optional<Branch> branchOpt = branchRepository.findById(requestDTO.getBranchId());
            if (branchOpt.isPresent()) {
                assignedBranch = branchOpt.get();
                manager.setBranch(assignedBranch);
            }
        }

        userRepository.save(manager);

        if (assignedBranch != null) {
            assignedBranch.setManager(manager);
            branchRepository.save(assignedBranch);
        }

        return ResponseEntity.ok(mapToResponseDTO(manager));
    }

    public List<ManagerResponseDTO> getAllManagers() {
        return userRepository.findByRole(Role.BRANCH_MANAGER).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public ResponseEntity<?> getManagerById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty() || userOpt.get().getRole() != Role.BRANCH_MANAGER) {
            return ResponseEntity.status(404).body(new MessageResponse("Manager not found with ID: " + id));
        }

        return ResponseEntity.ok(mapToResponseDTO(userOpt.get()));
    }

    @Transactional
    public ResponseEntity<?> updateManager(Long id, ManagerUpdateDTO updateDTO) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty() || userOpt.get().getRole() != Role.BRANCH_MANAGER) {
            return ResponseEntity.status(404).body(new MessageResponse("Manager not found with ID: " + id));
        }

        User manager = userOpt.get();

        if (updateDTO.getName() != null && !updateDTO.getName().isBlank()) {
            manager.setName(updateDTO.getName().trim());
        }

        if (updateDTO.getUsername() != null && !updateDTO.getUsername().isBlank()) {
            Optional<User> existing = userRepository.findByUsername(updateDTO.getUsername().trim());
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Username is already taken by another user"));
            }
            manager.setUsername(updateDTO.getUsername().trim());
        }

        if (updateDTO.getEmail() != null && !updateDTO.getEmail().isBlank()) {
            Optional<User> existing = userRepository.findByEmail(updateDTO.getEmail().trim());
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email is already registered with another user"));
            }
            manager.setEmail(updateDTO.getEmail().trim());
        }

        if (updateDTO.getPassword() != null && !updateDTO.getPassword().isBlank()) {
            manager.setPassword(encoder.encode(updateDTO.getPassword().trim()));
        }

        if (updateDTO.getActive() != null) {
            manager.setActive(updateDTO.getActive());
        }

        if (updateDTO.getBranchId() != null) {
            Optional<Branch> branchOpt = branchRepository.findById(updateDTO.getBranchId());
            if (branchOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new MessageResponse("Branch not found with ID: " + updateDTO.getBranchId()));
            }

            // Remove from old branch if any
            if (manager.getBranch() != null && !manager.getBranch().getId().equals(updateDTO.getBranchId())) {
                Branch oldBranch = manager.getBranch();
                oldBranch.setManager(null);
                branchRepository.save(oldBranch);
            }

            Branch newBranch = branchOpt.get();
            manager.setBranch(newBranch);
            newBranch.setManager(manager);
            branchRepository.save(newBranch);
        }

        userRepository.save(manager);

        return ResponseEntity.ok(mapToResponseDTO(manager));
    }

    public ManagerResponseDTO mapToResponseDTO(User user) {
        Long branchId = user.getBranch() != null ? user.getBranch().getId() : null;
        String branchName = user.getBranch() != null ? user.getBranch().getName() : null;
        String roleStr = user.getRole() != null ? user.getRole().name() : null;

        return new ManagerResponseDTO(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                roleStr,
                user.getActive(),
                branchId,
                branchName
        );
    }
}

