package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.BranchCreateDTO;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.entity.Branch;
import com.Multi_Branch_application.backend.repository.BranchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class BranchService {

    @Autowired
    BranchRepository branchRepository;

    public ResponseEntity<?> createBranch(BranchCreateDTO createDTO){

        Optional<Branch> existEmailOrMobile = branchRepository.findByEmailOrMobile(createDTO.getEmail(),createDTO.getMobile());

        if(existEmailOrMobile.isPresent()){
            return ResponseEntity.badRequest().body(new MessageResponse("Email or Mobile is already exist"));
        }

        Optional<Branch> existName = branchRepository.findByName(createDTO.getName());

        if(existName.isPresent()){
            return ResponseEntity.badRequest().body(new MessageResponse("Name is already exist"));
        }

        Branch branch = new Branch();
        branch.setName(createDTO.getName());
        branch.setMobile(createDTO.getEmail());
        branch.setMobile(createDTO.getMobile());
        branch.setAddress(createDTO.getAddress());

        branchRepository.save(branch);

        return ResponseEntity.ok().body(new MessageResponse("New Branch is created successfully"));

    }


}
