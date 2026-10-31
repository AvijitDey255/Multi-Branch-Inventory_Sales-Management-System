package com.Multi_Branch_application.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CategoryRequestDTO {
    private String name;
    private MultipartFile image;


}
