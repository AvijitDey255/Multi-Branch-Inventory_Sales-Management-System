package com.Multi_Branch_application.backend.controller;


import com.Multi_Branch_application.backend.dto.VariantsRequestDTO;
import com.Multi_Branch_application.backend.entity.Variants;
import com.Multi_Branch_application.backend.service.VariantsServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/variants")
public class VariantsController {

    @Autowired
    VariantsServices variantsServices;

    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public List<Variants> getAllVariants(){return variantsServices.getAllVariants();}

    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createVariants(@ModelAttribute VariantsRequestDTO requestDTO){
//        verify is not define now
        return variantsServices.createVariants(requestDTO);
    }

    @PostMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public  ResponseEntity<?> updateVariants(@PathVariable Long id,@ModelAttribute VariantsRequestDTO requestDTO){
//        verify is not define now
        return variantsServices.updateVariants(id,requestDTO);
    }


}
