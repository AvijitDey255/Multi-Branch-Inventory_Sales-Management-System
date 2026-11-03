package com.Multi_Branch_application.backend.repository;

import com.Multi_Branch_application.backend.entity.Product;
import com.Multi_Branch_application.backend.entity.Warehouse;
import com.Multi_Branch_application.backend.entity.WarehouseInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, Long> {
    boolean existsByWarehouseAndProduct(Warehouse warehouse, Product product);
    Optional<WarehouseInventory> findByWarehouseAndProduct(Warehouse warehouse, Product product);
    List<WarehouseInventory> findByWarehouse(Warehouse warehouse);
}

