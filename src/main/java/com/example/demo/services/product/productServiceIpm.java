package com.example.demo.services.product;

import com.example.demo.entity.Product;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.productRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class productServiceIpm implements productService {

    private final productRepository productRepository;

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(Long id, Product newProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(newProduct.getName());
                    product.setDescription(newProduct.getDescription());
                    product.setQuantity(newProduct.getQuantity());
                    product.setImageURL(newProduct.getImageURL());
                    product.setPrice(newProduct.getPrice());
                    product.setCategory(newProduct.getCategory());
                    product.setImages(newProduct.getImages());
                    product.setRatings(newProduct.getRatings());
                    product.setDetailCarts(newProduct.getDetailCarts());
                    product.setDetailOrders(newProduct.getDetailOrders());
                    product.setCatalogs(newProduct.getCatalogs());
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        productRepository.deleteById(id);
    }
}
