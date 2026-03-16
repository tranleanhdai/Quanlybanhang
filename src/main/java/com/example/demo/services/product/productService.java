package com.example.demo.services.product;

import com.example.demo.entity.Product;

import java.util.List;
import java.util.Optional;

public interface productService {
    List<Product> getAllProducts();
    Optional<Product> getProductById(Long id);
    Product createProduct(Product product);
    Product updateProduct(Long id, Product product);
    void deleteProduct(Long id);
}
