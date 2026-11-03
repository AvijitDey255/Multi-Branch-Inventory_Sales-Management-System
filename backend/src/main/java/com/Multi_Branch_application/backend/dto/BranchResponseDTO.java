package com.Multi_Branch_application.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String mobile;
    private String address;
    private Boolean active;

    @JsonProperty("branch_manager_id")
    private Long branchManagerId;

    @JsonProperty("branch_manager_name")
    private String branchManagerName;

    @JsonProperty("branch_manager_email")
    private String branchManagerEmail;
}

