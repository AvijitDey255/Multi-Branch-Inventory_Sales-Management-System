package com.Multi_Branch_application.backend.controller;

import com.Multi_Branch_application.backend.dto.CategoryRequestDTO;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.entity.Category;
import com.Multi_Branch_application.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    CategoryService categoryService;


    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@ModelAttribute CategoryRequestDTO categoryRequestDTO){

        if(categoryRequestDTO.getName() == null || categoryRequestDTO.getName().isBlank()){
            return ResponseEntity.badRequest().body(new MessageResponse("Category name is required"));
        }

        return categoryService.createCategory(categoryRequestDTO);
    }

    @PostMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable Long id,@ModelAttribute CategoryRequestDTO categoryRequestDTO){
        return categoryService.updateCategory(id,categoryRequestDTO);
    }


    @GetMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public List<Category> getAllCategory(){
        return categoryService.getAllCategory();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id){

        return categoryService.getCategoryById(id);

    }



}
