package com.Multi_Branch_application.backend.repository;

import com.Multi_Branch_application.backend.entity.Category;
import com.Multi_Branch_application.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryIdIn(Collection<Long> categoryIds);
    List<Product> findByCategoryIn(Collection<Category> categories);
}
