package com.Multi_Branch_application.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "warehouses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;

    // Inventory mapped to this warehouse
    @OneToMany(mappedBy = "warehouse")
    private List<WarehouseInventory> inventories = new ArrayList<>();
}
