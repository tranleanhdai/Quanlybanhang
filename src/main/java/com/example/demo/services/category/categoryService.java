package com.example.demo.services.category;

import com.example.demo.entity.Category;

import java.util.List;
import java.util.Optional;

public interface categoryService {
    List<Category> getAllCategories();
    Optional<Category> getCategoryById(Long id);
    Category createCategory(Category category);
    Category updateCategory(Long id, Category category);
    void deleteCategory(Long id);
}
