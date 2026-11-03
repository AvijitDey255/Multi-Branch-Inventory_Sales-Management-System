package com.Multi_Branch_application.backend.controller;


import com.Multi_Branch_application.backend.dto.BranchCreateDTO;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.service.BranchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/branchs")
public class BranchController {

    @Autowired
    BranchService branchService;


    @PostMapping("/register")
    @PreAuthorize("hasRole('BRANCH_MANAGER') OR hasRole('SALESMAN')")
    public ResponseEntity<?> createBranch(@RequestBody BranchCreateDTO requestDTO){

        if(requestDTO.getName() == null || requestDTO.getName().isBlank()){
            return ResponseEntity.badRequest().body(new MessageResponse("Branch name is required"));
        }

        if(requestDTO.getEmail() == null || requestDTO.getEmail().isBlank()){
            return ResponseEntity.badRequest().body(new MessageResponse("Branch Email is required"));
        }
        if(requestDTO.getMobile() == null || requestDTO.getMobile().isBlank()){
            return ResponseEntity.badRequest().body(new MessageResponse("Branch mobile is required"));
        }
        if(requestDTO.getAddress() == null || requestDTO.getAddress().isBlank()){
            return ResponseEntity.badRequest().body(new MessageResponse("Address is required"));
        }

        return branchService.createBranch(requestDTO);

    }
}
