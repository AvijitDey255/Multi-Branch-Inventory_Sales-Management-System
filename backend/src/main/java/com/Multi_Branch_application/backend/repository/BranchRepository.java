package com.Multi_Branch_application.backend.repository;

import com.Multi_Branch_application.backend.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch,Long> {

    Optional<Branch> findByName(String name);
    Optional<Branch> findByEmail(String email);
    Optional<Branch> findByMobile(String mobile);
    Optional<Branch> findByEmailOrMobile(String email,String mobile);
}
