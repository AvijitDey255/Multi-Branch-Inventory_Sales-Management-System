package com.Multi_Branch_application.backend.controller;

import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.dto.ProductRequest;
import com.Multi_Branch_application.backend.entity.Product;
import com.Multi_Branch_application.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    ProductService productService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@ModelAttribute ProductRequest productRequest) {

        if(productRequest.getName()== null || productRequest.getName().isBlank()){
            return ResponseEntity.badRequest().body(new MessageResponse("Name is required"));
        }
        if(productRequest.getImage()== null || productRequest.getImage().isEmpty()){
            return ResponseEntity.badRequest().body(new MessageResponse("Image is required"));
        }
        if(productRequest.getCategory()== null){
            return ResponseEntity.badRequest().body(new MessageResponse("Category is required"));
        }
        if(productRequest.getStock_quantity()== null){
            return ResponseEntity.badRequest().body(new MessageResponse("Stock Quantity is required"));
        }
        if(productRequest.getSelling_price()== null){
            return ResponseEntity.badRequest().body(new MessageResponse("Selling Price is required"));
        }



        return productService.createProduct(productRequest);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @ModelAttribute ProductRequest productRequest) {
        return productService.updateProduct(id, productRequest);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        return productService.deleteProduct(id);
    }
}
