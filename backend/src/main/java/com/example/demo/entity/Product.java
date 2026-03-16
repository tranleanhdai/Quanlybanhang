package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Product extends Base {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ====== Text fields: Unicode, length rõ ràng ======
    @Column(name = "name", length = 255)
    private String name;

    // cột đã ALTER thành NVARCHAR(MAX), khai báo rõ cho chắc
    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "quantity")
    private int quantity;

    // DB đang là cột imageurl, map rõ tên cột
    @Column(name = "imageurl", length = 255)
    private String imageURL;

    @Column(name = "price")
    private Double price;

    // ====== Quan hệ ======
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<DetailProductImage> images;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Rating> ratings;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<DetailCart> detailCarts;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<DetailOrder> detailOrders;

    @ManyToMany(mappedBy = "products")
    private List<Catalog> catalogs;
}
