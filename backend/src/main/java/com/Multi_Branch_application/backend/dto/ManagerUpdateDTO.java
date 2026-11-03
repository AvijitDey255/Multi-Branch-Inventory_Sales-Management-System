package com.Multi_Branch_application.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ManagerUpdateDTO {

    private String name;
    private String username;
    private String email;
    private String password;
    private Boolean active;

    @JsonAlias({"branch_id", "branchId"})
    private Long branchId;
}

