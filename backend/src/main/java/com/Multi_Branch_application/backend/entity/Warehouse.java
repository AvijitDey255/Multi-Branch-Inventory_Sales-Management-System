package com.Multi_Branch_application.backend.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "warehouses")
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
