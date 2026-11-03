package com.Multi_Branch_application.backend.repository;

import com.Multi_Branch_application.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer,Long> {
    Optional<Customer> findByMobileOrEmail(String mobile,String email);
}
