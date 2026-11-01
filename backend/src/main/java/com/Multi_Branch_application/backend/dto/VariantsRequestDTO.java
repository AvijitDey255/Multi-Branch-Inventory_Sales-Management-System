package com.Multi_Branch_application.backend.dto;

import com.Multi_Branch_application.backend.entity.Variants_type;
import lombok.Data;

@Data
public class VariantsRequestDTO {
    private Variants_type name;
    private String value;
}
