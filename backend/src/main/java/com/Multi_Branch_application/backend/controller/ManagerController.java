package com.Multi_Branch_application.backend.controller;

import com.Multi_Branch_application.backend.dto.ManagerRequestDTO;
import com.Multi_Branch_application.backend.dto.ManagerResponseDTO;
import com.Multi_Branch_application.backend.dto.ManagerUpdateDTO;
import com.Multi_Branch_application.backend.service.ManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/managers")
public class ManagerController {

    @Autowired
    private ManagerService managerService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createManager(@RequestBody ManagerRequestDTO requestDTO) {
        return managerService.createManager(requestDTO);
    }

    @GetMapping({"", "/all"})
    @PreAuthorize("hasRole('ADMIN')")
    public List<ManagerResponseDTO> getAllManagers() {
        return managerService.getAllManagers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getManagerById(@PathVariable Long id) {
        return managerService.getManagerById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateManager(@PathVariable Long id, @RequestBody ManagerUpdateDTO updateDTO) {
        return managerService.updateManager(id, updateDTO);
    }
}

