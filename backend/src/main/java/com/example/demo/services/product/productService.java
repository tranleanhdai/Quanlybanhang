package com.example.demo.services.product;

import com.example.demo.entity.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface productService {
    List<Product> getAllProducts();
    Optional<Product> getProductById(Long id);
    Product createProduct(Product product);
    Product updateProduct(Long id, Product product);
    void deleteProduct(Long id);

    // Import 1 product từ PDF
    Product importProductFromPdf(MultipartFile file);

    // ✅ Gợi ý sản phẩm liên quan
    List<Product> getRelatedProducts(Long productId, int limit);
}
