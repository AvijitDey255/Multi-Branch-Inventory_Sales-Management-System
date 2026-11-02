package com.Multi_Branch_application.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Float mrp = (float) 0;
    private Float selling_price =(float) 0;
    private String packagingTyp = "";
    private String volume = "";
    private String brand = "";
    private String units = "";
    private String size = "";
    private String color = "";
    private String weight = "";
    private Integer stock_quantity = 0;
    private String imageUrl = "";
    private String imageId = "";

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToMany
    @JoinTable(
            name = "product_variants",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "variant_id")
    )
    private Set<Variants> variants = new HashSet<>();
}
