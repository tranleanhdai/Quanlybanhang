package com.example.demo.controllers;

import com.example.demo.entity.Product;
import com.example.demo.services.product.productService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class productController {

    private final productService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Optional<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    // ✅ Import từ PDF (multipart/form-data)
    @PostMapping(
            path = "/import-pdf",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Product importFromPdf(@RequestPart("file") MultipartFile file) {
        return productService.importProductFromPdf(file);
    }

    // ✅ API gợi ý sản phẩm liên quan
    @GetMapping("/{id}/related")
    public List<Product> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam(name = "limit", defaultValue = "8") int limit
    ) {
        return productService.getRelatedProducts(id, limit);
    }
}
