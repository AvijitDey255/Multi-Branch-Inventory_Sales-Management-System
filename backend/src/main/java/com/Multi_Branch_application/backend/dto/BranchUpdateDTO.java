package com.Multi_Branch_application.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchUpdateDTO {
    private String name;
    private String email;
    private String mobile;
    private String address;
    private Boolean active;

    @JsonAlias({"manager_id", "managerId", "branch_manager_id"})
    private Long managerId;
}

