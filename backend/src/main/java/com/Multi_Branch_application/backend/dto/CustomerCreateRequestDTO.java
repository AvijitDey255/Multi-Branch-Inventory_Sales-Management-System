package com.Multi_Branch_application.backend.dto;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;


@Data
public class CustomerCreateRequestDTO {
    private String name;
    private String email;
    private String mobile;
}
