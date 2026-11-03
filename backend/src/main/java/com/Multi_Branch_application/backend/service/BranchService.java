package com.Multi_Branch_application.backend.service;

import com.Multi_Branch_application.backend.dto.BranchCreateDTO;
import com.Multi_Branch_application.backend.dto.BranchResponseDTO;
import com.Multi_Branch_application.backend.dto.BranchUpdateDTO;
import com.Multi_Branch_application.backend.dto.MessageResponse;
import com.Multi_Branch_application.backend.entity.*;
import com.Multi_Branch_application.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BranchService {

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private WarehouseInventoryRepository warehouseInventoryRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ResponseEntity<?> createBranch(BranchCreateDTO createDTO) {

        Optional<Branch> existEmailOrMobile = branchRepository.findByEmailOrMobile(createDTO.getEmail(), createDTO.getMobile());
        if (existEmailOrMobile.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email or Mobile is already registered"));
        }

        Optional<Branch> existName = branchRepository.findByName(createDTO.getName());
        if (existName.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Branch Name is already registered"));
        }

        // 1. Create and save Branch
        Branch branch = new Branch();
        branch.setName(createDTO.getName());
        branch.setEmail(createDTO.getEmail());
        branch.setMobile(createDTO.getMobile());
        branch.setAddress(createDTO.getAddress());
        branch.setActive(true);
        branch.setManager(null);
        branch.setAllowedCategories(new HashSet<>());

        // 2. Automatically create Warehouse for this Branch
        Warehouse warehouse = new Warehouse();
        warehouse.setBranch(branch);
        branch.setWarehouse(warehouse);

        branchRepository.save(branch);

        return ResponseEntity.ok().body(new MessageResponse("New Branch and Warehouse created successfully with ID: " + branch.getId()));
    }

    public List<BranchResponseDTO> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public ResponseEntity<?> getBranchById(Long branchId) {
        Optional<Branch> branchOpt = branchRepository.findById(branchId);
        if (branchOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("Branch not found with ID: " + branchId));
        }
        return ResponseEntity.ok(mapToResponseDTO(branchOpt.get()));
    }

    @Transactional
    public ResponseEntity<?> updateBranch(Long branchId, BranchUpdateDTO updateDTO) {
        Optional<Branch> branchOpt = branchRepository.findById(branchId);
        if (branchOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("Branch not found with ID: " + branchId));
        }

        Branch branch = branchOpt.get();

        if (updateDTO.getName() != null && !updateDTO.getName().isBlank()) {
            Optional<Branch> existing = branchRepository.findByName(updateDTO.getName().trim());
            if (existing.isPresent() && !existing.get().getId().equals(branchId)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Branch name is already taken"));
            }
            branch.setName(updateDTO.getName().trim());
        }

        if (updateDTO.getEmail() != null && !updateDTO.getEmail().isBlank()) {
            Optional<Branch> existing = branchRepository.findByEmail(updateDTO.getEmail().trim());
            if (existing.isPresent() && !existing.get().getId().equals(branchId)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Email is already registered with another branch"));
            }
            branch.setEmail(updateDTO.getEmail().trim());
        }

        if (updateDTO.getMobile() != null && !updateDTO.getMobile().isBlank()) {
            Optional<Branch> existing = branchRepository.findByMobile(updateDTO.getMobile().trim());
            if (existing.isPresent() && !existing.get().getId().equals(branchId)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Mobile is already registered with another branch"));
            }
            branch.setMobile(updateDTO.getMobile().trim());
        }

        if (updateDTO.getAddress() != null && !updateDTO.getAddress().isBlank()) {
            branch.setAddress(updateDTO.getAddress().trim());
        }

        if (updateDTO.getActive() != null) {
            branch.setActive(updateDTO.getActive());
        }

        if (updateDTO.getManagerId() != null) {
            Optional<User> managerOpt = userRepository.findById(updateDTO.getManagerId());
            if (managerOpt.isEmpty()) {
                return ResponseEntity.status(404).body(new MessageResponse("Manager not found with ID: " + updateDTO.getManagerId()));
            }
            User manager = managerOpt.get();
            branch.setManager(manager);
            manager.setBranch(branch);
            userRepository.save(manager);
        }

        branchRepository.save(branch);

        return ResponseEntity.ok(mapToResponseDTO(branch));
    }

    @Transactional
    public ResponseEntity<?> assignManager(Long branchId, Long managerId) {
        Optional<Branch> branchOpt = branchRepository.findById(branchId);
        if (branchOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("Branch not found with ID: " + branchId));
        }

        Optional<User> userOpt = userRepository.findById(managerId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("User/Manager not found with ID: " + managerId));
        }

        User manager = userOpt.get();
        Branch branch = branchOpt.get();
        branch.setManager(manager);
        manager.setBranch(branch);
        userRepository.save(manager);
        branchRepository.save(branch);

        return ResponseEntity.ok().body(new MessageResponse("Manager " + manager.getName() + " assigned to Branch " + branch.getName() + " successfully"));
    }

    @Transactional
    public ResponseEntity<?> assignCategories(Long branchId, List<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Category IDs list cannot be empty"));
        }

        Optional<Branch> branchOpt = branchRepository.findById(branchId);
        if (branchOpt.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("Branch not found with ID: " + branchId));
        }

        Branch branch = branchOpt.get();

        // Ensure Warehouse exists for this Branch
        Warehouse warehouse = branch.getWarehouse();
        if (warehouse == null) {
            warehouse = warehouseRepository.findByBranch(branch)
                    .orElseGet(() -> {
                        Warehouse newWarehouse = new Warehouse();
                        newWarehouse.setBranch(branch);
                        return warehouseRepository.save(newWarehouse);
                    });
            branch.setWarehouse(warehouse);
        }

        // 1. Assign allowed categories to Branch
        List<Category> categories = categoryRepository.findAllById(categoryIds);
        if (categories.isEmpty()) {
            return ResponseEntity.status(404).body(new MessageResponse("No valid categories found for given IDs"));
        }

        branch.getAllowedCategories().addAll(categories);
        branchRepository.save(branch);

        // 2. Find all products belonging to these assigned categories
        List<Product> products = productRepository.findByCategoryIdIn(categoryIds);

        // 3. Populate products into Warehouse inventory with stockQuantity = 0
        List<WarehouseInventory> newInventories = new ArrayList<>();
        for (Product product : products) {
            boolean exists = warehouseInventoryRepository.existsByWarehouseAndProduct(warehouse, product);
            if (!exists) {
                WarehouseInventory inventory = new WarehouseInventory();
                inventory.setWarehouse(warehouse);
                inventory.setProduct(product);
                inventory.setStockQuantity(0);
                newInventories.add(inventory);
            }
        }

        if (!newInventories.isEmpty()) {
            warehouseInventoryRepository.saveAll(newInventories);
        }

        return ResponseEntity.ok().body(new MessageResponse(
                "Categories assigned successfully. Added " + newInventories.size() + " product(s) to Warehouse inventory."
        ));
    }

    public BranchResponseDTO mapToResponseDTO(Branch branch) {
        User manager = branch.getManager();
        Long managerId = manager != null ? manager.getId() : null;
        String managerName = manager != null ? (manager.getName() != null ? manager.getName() : manager.getUsername()) : null;
        String managerEmail = manager != null ? manager.getEmail() : null;

        return new BranchResponseDTO(
                branch.getId(),
                branch.getName(),
                branch.getEmail(),
                branch.getMobile(),
                branch.getAddress(),
                branch.getActive(),
                managerId,
                managerName,
                managerEmail
        );
    }
}
