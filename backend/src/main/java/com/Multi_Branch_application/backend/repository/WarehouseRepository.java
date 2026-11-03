package com.Multi_Branch_application.backend.repository;

import com.Multi_Branch_application.backend.entity.Branch;
import com.Multi_Branch_application.backend.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByBranch(Branch branch);
    Optional<Warehouse> findByBranchId(Long branchId);
}

