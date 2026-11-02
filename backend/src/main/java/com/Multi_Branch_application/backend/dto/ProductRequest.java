package com.Multi_Branch_application.backend.dto;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ProductRequest {
//    name , image, category ,mrp,packagingTyp,volume,brand,units,size,color,weight,selling_price , stock_quantity

    private String name;
    private Long category;
    private Float mrp;
    private Float selling_price;
    private Long packagingTyp;
    private Long volume;
    private Long brand;
    private Long units;
    private Long size;
    private Long color;
    private Long weight;
    private Integer stock_quantity;
    private MultipartFile image;
}
