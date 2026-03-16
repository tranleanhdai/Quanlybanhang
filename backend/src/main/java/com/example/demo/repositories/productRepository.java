package com.example.demo.repositories;

import com.example.demo.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface productRepository extends JpaRepository<Product, Long> {

    @Query("""
        SELECT p FROM Product p
        WHERE p.category.id = :categoryId
          AND p.id <> :excludeId
        ORDER BY p.id DESC
    """)
    List<Product> findRelatedProducts(
            @Param("categoryId") Long categoryId,
            @Param("excludeId") Long excludeId
    );

    // Fallback nếu sản phẩm không có category
    List<Product> findTop10ByIdIsNotOrderByIdDesc(Long excludeId);
}
