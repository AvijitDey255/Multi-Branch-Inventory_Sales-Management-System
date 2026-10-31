package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.CategoryRequestDTO;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.entity.Category;
import com.Multi_Branch_application.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    CloudinaryService cloudinaryService;

    public List<Category> getAllCategory(){return categoryRepository.findAll();}

    public ResponseEntity<?> createCategory(CategoryRequestDTO categoryRequest){

        Category category = new Category();
        category.setName(categoryRequest.getName());


        try {

            if(categoryRequest.getImage() != null && !categoryRequest.getImage().isEmpty()){
                Map uploadResult = cloudinaryService.uploadImage(categoryRequest.getImage());

                category.setImageUrl(uploadResult.get("url").toString());
                category.setImageId(uploadResult.get("public_id").toString());
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error uploading image: " + e.getMessage()));
        }

        categoryRepository.save(category);
        return ResponseEntity.ok(new MessageResponse("Product created successfully!"));

    }

    public ResponseEntity<?> getCategoryById(Long id){

         Optional<Category> getCategory = categoryRepository.findById(id);

         if(getCategory.isEmpty()){
             return ResponseEntity.status(HttpStatus.NOT_FOUND)
                     .body(new MessageResponse("Category is not found"));
         }

        return ResponseEntity.ok(getCategory);
    }

    public ResponseEntity<?> updateCategory(Long id ,CategoryRequestDTO requestDTO){

        Optional<Category> getCategory = categoryRepository.findById(id);

        Category category = getCategory.get();

        if(requestDTO.getName() != null) category.setName(requestDTO.getName());
        try{
            if(requestDTO.getImage() != null && !requestDTO.getImage().isEmpty()){

                if(category.getImageId() != null){
                    cloudinaryService.deleteImage(category.getImageId());
                }
                Map uploadResult = cloudinaryService.uploadImage(requestDTO.getImage());
                category.setImageId(uploadResult.get("public_id").toString());
                category.setImageUrl(uploadResult.get("url").toString());
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        categoryRepository.save(category);

        return ResponseEntity.ok(new MessageResponse("Category update susseccfully"));
    }

}
