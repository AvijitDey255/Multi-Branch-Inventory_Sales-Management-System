package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.dto.ProductRequest;
import com.Multi_Branch_application.backend.entity.Category;
import com.Multi_Branch_application.backend.entity.Product;
import com.Multi_Branch_application.backend.entity.Variants;
import com.Multi_Branch_application.backend.repository.CategoryRepository;
import com.Multi_Branch_application.backend.repository.ProductRepository;
import com.Multi_Branch_application.backend.repository.VariantsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private VariantsRepository variantsRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public ResponseEntity<?> createProduct(ProductRequest productRequest) {
        Optional<Category> categoryOpt = categoryRepository.findById(productRequest.getCategory());
        if (categoryOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Category is not found"));
        }

        Product product = new Product();
        product.setName(productRequest.getName());
        product.setMrp(productRequest.getMrp() != null ? productRequest.getMrp() : 0.0f);
        product.setSelling_price(productRequest.getSelling_price() != null ? productRequest.getSelling_price() : 0.0f);
        product.setStock_quantity(productRequest.getStock_quantity() != null ? productRequest.getStock_quantity() : 0);
        product.setCategory(categoryOpt.get());

        // Map and attach variants
        applyVariants(product, productRequest);

        // Upload image to Cloudinary
        if (productRequest.getImage() != null && !productRequest.getImage().isEmpty()) {
            try {
                Map<?, ?> uploadResult = cloudinaryService.uploadImage(productRequest.getImage());
                product.setImageUrl(uploadResult.get("url").toString());
                product.setImageId(uploadResult.get("public_id").toString());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error uploading image: " + e.getMessage()));
            }
        }

        productRepository.save(product);
        return ResponseEntity.ok(new MessageResponse("Product created successfully!"));
    }

    @Transactional
    public ResponseEntity<?> updateProduct(Long id, ProductRequest productRequest) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Product not found with ID: " + id));
        }

        Product product = productOpt.get();

        // 1. Update basic fields if present
        if (productRequest.getName() != null && !productRequest.getName().isBlank()) {
            product.setName(productRequest.getName());
        }
        if (productRequest.getMrp() != null) {
            product.setMrp(productRequest.getMrp());
        }
        if (productRequest.getSelling_price() != null) {
            product.setSelling_price(productRequest.getSelling_price());
        }
        if (productRequest.getStock_quantity() != null) {
            product.setStock_quantity(productRequest.getStock_quantity());
        }

        // 2. Update category if provided
        if (productRequest.getCategory() != null) {
            Optional<Category> categoryOpt = categoryRepository.findById(productRequest.getCategory());
            if (categoryOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Category not found with ID: " + productRequest.getCategory()));
            }
            product.setCategory(categoryOpt.get());
        }

        // 3. Update variants if any variant ID is supplied in the request
        boolean hasVariantUpdates = Stream.of(
                productRequest.getPackagingTyp(),
                productRequest.getVolume(),
                productRequest.getBrand(),
                productRequest.getUnits(),
                productRequest.getSize(),
                productRequest.getColor(),
                productRequest.getWeight()
        ).anyMatch(Objects::nonNull);

        if (hasVariantUpdates) {
            applyVariants(product, productRequest);
        }

        // 4. Update image if a new image file is provided
        if (productRequest.getImage() != null && !productRequest.getImage().isEmpty()) {
            try {
                // Delete existing Cloudinary asset if present
                if (product.getImageId() != null && !product.getImageId().isBlank()) {
                    cloudinaryService.deleteImage(product.getImageId());
                }

                // Upload new image
                Map<?, ?> uploadResult = cloudinaryService.uploadImage(productRequest.getImage());
                product.setImageUrl(uploadResult.get("url").toString());
                product.setImageId(uploadResult.get("public_id").toString());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error uploading new image: " + e.getMessage()));
            }
        }

        productRepository.save(product);
        return ResponseEntity.ok(new MessageResponse("Product updated successfully!"));
    }

    @Transactional
    public ResponseEntity<?> deleteProduct(Long id) {
        Optional<Product> productOpt = productRepository.findById(id);
        if (productOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Product not found!"));
        }

        Product product = productOpt.get();

        try {
            if (product.getImageId() != null && !product.getImageId().isBlank()) {
                cloudinaryService.deleteImage(product.getImageId());
            }
        } catch (Exception e) {
            System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
        }

        productRepository.delete(product);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully!"));
    }

    /**
     * Helper to batch fetch and set variants and flat text fields
     */
//    private void applyVariants(Product product, ProductRequest productRequest) {
//        List<Long> variantIds = Stream.of(
//                productRequest.getPackagingTyp(),
//                productRequest.getVolume(),
//                productRequest.getBrand(),
//                productRequest.getUnits(),
//                productRequest.getSize(),
//                productRequest.getColor(),
//                productRequest.getWeight()
//        ).filter(Objects::nonNull).collect(Collectors.toList());
//
//        if (variantIds.isEmpty()) {
//            return;
//        }
//
//        List<Variants> fetchedVariants = variantsRepository.findAllById(variantIds);
//        product.setVariants(new HashSet<>(fetchedVariants));
//
//        Map<Long, String> variantNameMap = fetchedVariants.stream()
//                .collect(Collectors.toMap(
//                        Variants::getId,
//                        v -> v.getName() != null ? v.getName().name() : "",
//                        (existing, replacement) -> existing
//                ));
//
//        if (productRequest.getPackagingTyp() != null) {
//            product.setPackagingTyp(variantNameMap.getOrDefault(productRequest.getPackagingTyp(), ""));
//        }
//        if (productRequest.getVolume() != null) {
//            product.setVolume(variantNameMap.getOrDefault(productRequest.getVolume(), ""));
//        }
//        if (productRequest.getBrand() != null) {
//            product.setBrand(variantNameMap.getOrDefault(productRequest.getBrand(), ""));
//        }
//        if (productRequest.getUnits() != null) {
//            product.setUnits(variantNameMap.getOrDefault(productRequest.getUnits(), ""));
//        }
//        if (productRequest.getSize() != null) {
//            product.setSize(variantNameMap.getOrDefault(productRequest.getSize(), ""));
//        }
//        if (productRequest.getColor() != null) {
//            product.setColor(variantNameMap.getOrDefault(productRequest.getColor(), ""));
//        }
//        if (productRequest.getWeight() != null) {
//            product.setWeight(variantNameMap.getOrDefault(productRequest.getWeight(), ""));
//        }
//    }


    private void applyVariants(Product product, ProductRequest productRequest) {
        List<Long> variantIds = Stream.of(
                productRequest.getPackagingTyp(),
                productRequest.getVolume(),
                productRequest.getBrand(),
                productRequest.getUnits(),
                productRequest.getSize(),
                productRequest.getColor(),
                productRequest.getWeight()
        ).filter(Objects::nonNull).collect(Collectors.toList());

        if (variantIds.isEmpty()) {
            return;
        }

        List<Variants> fetchedVariants = variantsRepository.findAllById(variantIds);
        product.setVariants(new HashSet<>(fetchedVariants));

        // Map variant ID to its actual string value
        Map<Long, String> variantValueMap = fetchedVariants.stream()
                .collect(Collectors.toMap(
                        Variants::getId,
                        v -> v.getValue() != null ? String.valueOf(v.getValue()) : "",
                        (existing, replacement) -> existing
                ));

        if (productRequest.getPackagingTyp() != null) {
            product.setPackagingTyp(variantValueMap.getOrDefault(productRequest.getPackagingTyp(), ""));
        }
        if (productRequest.getVolume() != null) {
            product.setVolume(variantValueMap.getOrDefault(productRequest.getVolume(), ""));
        }
        if (productRequest.getBrand() != null) {
            product.setBrand(variantValueMap.getOrDefault(productRequest.getBrand(), ""));
        }
        if (productRequest.getUnits() != null) {
            product.setUnits(variantValueMap.getOrDefault(productRequest.getUnits(), ""));
        }
        if (productRequest.getSize() != null) {
            product.setSize(variantValueMap.getOrDefault(productRequest.getSize(), ""));
        }
        if (productRequest.getColor() != null) {
            product.setColor(variantValueMap.getOrDefault(productRequest.getColor(), ""));
        }
        if (productRequest.getWeight() != null) {
            product.setWeight(variantValueMap.getOrDefault(productRequest.getWeight(), ""));
        }
    }
}