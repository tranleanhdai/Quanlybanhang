package com.example.demo.repositories;

import com.example.demo.entity.DetailProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface detailProductImageRepository extends JpaRepository<DetailProductImage,Long> {
    List<DetailProductImage> findByProductId(Long productId);

}
