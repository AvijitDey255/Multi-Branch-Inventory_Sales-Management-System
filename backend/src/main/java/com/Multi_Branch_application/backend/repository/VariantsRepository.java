package com.Multi_Branch_application.backend.repository;

import com.Multi_Branch_application.backend.entity.Variants;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariantsRepository extends JpaRepository<Variants,Long> {
}
