package com.Multi_Branch_application.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchCreateDTO {

    private String name;
    private String email;
    private String mobile;
    private String address;

    @JsonAlias({"manager_id", "managerId"})
    private Long managerId;

    @JsonAlias({"categorys_ids", "category_ids", "categoryIds"})
    private List<Long> categoryIds;
}
