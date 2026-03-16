package com.example.demo.services.detailCart;

import com.example.demo.entity.DetailCart;

import java.util.List;
import java.util.Optional;

public interface detailCartService {
    List<DetailCart> getAllDetailCarts();
    Optional<DetailCart> getDetailCartById(Long id);
    List<DetailCart> getDetailCartsByCartId(Long cartId);
    List<DetailCart> getDetailCartsByProductId(Long productId);
    DetailCart createDetailCart(DetailCart detailCart);
    DetailCart updateDetailCart(Long id, DetailCart detailCart);
    void deleteDetailCart(Long id);
}
