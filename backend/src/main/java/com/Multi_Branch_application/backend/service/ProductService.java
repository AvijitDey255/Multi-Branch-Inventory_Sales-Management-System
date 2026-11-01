package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.dto.ProductRequest;
import com.Multi_Branch_application.backend.entity.Product;
import com.Multi_Branch_application.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    CloudinaryService cloudinaryService;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public ResponseEntity<?> createProduct(ProductRequest productRequest) {
        Product product = new Product();
        product.setName(productRequest.getName());
        product.setDescription(productRequest.getDescription());
        product.setSelling_price(productRequest.getPrice());
        product.setQuantity(productRequest.getQuantity());

        try {
            if (productRequest.getImage() != null && !productRequest.getImage().isEmpty()) {
                Map uploadResult = cloudinaryService.uploadImage(productRequest.getImage());
                product.setImageUrl(uploadResult.get("url").toString());
                product.setImageId(uploadResult.get("public_id").toString());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error uploading image: " + e.getMessage()));
        }

        productRepository.save(product);

        return ResponseEntity.ok(new MessageResponse("Product created successfully!"));
    }

    public ResponseEntity<?> updateProduct(Long id, ProductRequest productRequest) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (!productOpt.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Product not found!"));
        }

        Product product = productOpt.get();
        if (productRequest.getName() != null) product.setName(productRequest.getName());
        if (productRequest.getDescription() != null) product.setDescription(productRequest.getDescription());
        if (productRequest.getPrice() != null) product.setSelling_price(productRequest.getPrice());
        if (productRequest.getQuantity() != null) product.setQuantity(productRequest.getQuantity());

        try {
            if (productRequest.getImage() != null && !productRequest.getImage().isEmpty()) {
                // Delete old image if it exists
                if (product.getImageId() != null) {
                    cloudinaryService.deleteImage(product.getImageId());
                }
                
                // Upload new image
                Map uploadResult = cloudinaryService.uploadImage(productRequest.getImage());
                product.setImageUrl(uploadResult.get("url").toString());
                product.setImageId(uploadResult.get("public_id").toString());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error uploading new image: " + e.getMessage()));
        }

        productRepository.save(product);

        return ResponseEntity.ok(new MessageResponse("Product updated successfully!"));
    }

    public ResponseEntity<?> deleteProduct(Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (!productOpt.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Product not found!"));
        }

        Product product = productOpt.get();
        
        try {
            // Delete image from Cloudinary
            if (product.getImageId() != null) {
                cloudinaryService.deleteImage(product.getImageId());
            }
        } catch (Exception e) {
            System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
        }

        productRepository.delete(product);

        return ResponseEntity.ok(new MessageResponse("Product deleted successfully!"));
    }
}
