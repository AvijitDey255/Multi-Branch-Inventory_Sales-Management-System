package com.Multi_Branch_application.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

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

    // The Branch Manager
    @OneToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    // Allowed categories for this branch (e.g., Branch 1: Oil, Rice)
    @ManyToMany
    @JoinTable(
            name = "branch_categories",
            joinColumns = @JoinColumn(name = "branch_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> allowedCategories = new HashSet<>();

    @OneToOne(mappedBy = "branch", cascade = CascadeType.ALL)
    private Warehouse warehouse;


}
