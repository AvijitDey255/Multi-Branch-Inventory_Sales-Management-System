package com.Multi_Branch_application.backend.controller;

import com.Multi_Branch_application.backend.dto.BranchCreateDTO;
import com.Multi_Branch_application.backend.dto.BranchResponseDTO;
import com.Multi_Branch_application.backend.dto.BranchUpdateDTO;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.service.BranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/branchs")
public class BranchController {

    @Autowired
    private BranchService branchService;

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN') OR hasRole('BRANCH_MANAGER')")
    public ResponseEntity<?> createBranch(@RequestBody BranchCreateDTO requestDTO) {

        if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Branch name is required"));
        }

        if (requestDTO.getEmail() == null || requestDTO.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Branch Email is required"));
        }
        if (requestDTO.getMobile() == null || requestDTO.getMobile().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Branch mobile is required"));
        }
        if (requestDTO.getAddress() == null || requestDTO.getAddress().isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Address is required"));
        }

        return branchService.createBranch(requestDTO);
    }

    @GetMapping({"", "/all"})
    @PreAuthorize("hasRole('ADMIN') OR hasRole('BRANCH_MANAGER') OR hasRole('SALESMAN')")
    public List<BranchResponseDTO> getAllBranches() {
        return branchService.getAllBranches();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') OR hasRole('BRANCH_MANAGER') OR hasRole('SALESMAN')")
    public ResponseEntity<?> getBranchById(@PathVariable Long id) {
        return branchService.getBranchById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') OR hasRole('BRANCH_MANAGER')")
    public ResponseEntity<?> updateBranch(@PathVariable Long id, @RequestBody BranchUpdateDTO updateDTO) {
        return branchService.updateBranch(id, updateDTO);
    }

    @PutMapping("/{branchId}/assign-manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignManager(@PathVariable Long branchId, @PathVariable Long managerId) {
        return branchService.assignManager(branchId, managerId);
    }

    @PutMapping("/{branchId}/assign-categories")
    @PreAuthorize("hasRole('ADMIN') OR hasRole('BRANCH_MANAGER')")
    public ResponseEntity<?> assignCategories(@PathVariable Long branchId, @RequestBody List<Long> categoryIds) {
        return branchService.assignCategories(branchId, categoryIds);
    }
}
