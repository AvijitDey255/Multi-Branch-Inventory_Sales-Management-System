package com.Multi_Branch_application.backend.controller;


import com.Multi_Branch_application.backend.dto.CategoryRequestDTO;
import com.Multi_Branch_application.backend.dto.CustomerCreateRequestDTO;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.service.CustomerServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    CustomerServices customerServices;

    @PostMapping("/register")
    @PreAuthorize("hasRole('BRANCH_MANAGER') OR hasRole('SALESMAN')")
    public ResponseEntity<?> RegisterCustomer(@ModelAttribute CustomerCreateRequestDTO requestDTO){

        if(requestDTO.getName() == null || requestDTO.getName().isBlank()){
            return ResponseEntity.badRequest().body(new MessageResponse("Customer name is required"));
        }

        if(requestDTO.getEmail() == null || requestDTO.getEmail().isBlank()){
            return ResponseEntity.badRequest().body(new MessageResponse("Customer Email is required"));
        }
        if(requestDTO.getMobile() == null || requestDTO.getMobile().isBlank()){
            return ResponseEntity.badRequest().body(new MessageResponse("Customer mobile is required"));
        }


        return customerServices.createCustomer(requestDTO);

    }




}
