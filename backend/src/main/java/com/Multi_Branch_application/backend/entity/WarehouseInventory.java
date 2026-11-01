package com.Multi_Branch_application.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "warehouse_inventory")
public class WarehouseInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer stockQuantity;
}
