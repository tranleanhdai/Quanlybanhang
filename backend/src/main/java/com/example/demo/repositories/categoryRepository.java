package com.example.demo.repositories;

import com.example.demo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface categoryRepository extends JpaRepository<Category, Long> {

    // Dùng để tìm category theo tên trong PDF: "Danh mục: Điện thoại"
    Optional<Category> findByNameIgnoreCase(String name);
}
