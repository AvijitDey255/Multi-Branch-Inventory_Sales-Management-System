package com.Multi_Branch_application.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "branches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String phone;
    private String address;

    private Boolean active = true;

    @OneToOne
    @JoinColumn(name="manager_id")
    private User manager;

    @OneToOne(mappedBy = "branch",cascade = CascadeType.ALL)
    private Godown godown;
}
