package com.example.demo.services.cart;

import com.example.demo.entity.Cart;

import java.util.List;
import java.util.Optional;

public interface cartService {
    List<Cart> getAllCarts();
    Optional<Cart> getCartById(Long id);
    List<Cart> getCartsByUserId(Long userId);

    // đổi createCart nhận userId
    Cart createCart(Long userId);

    Cart updateCart(Long id, Cart cart);
    void deleteCart(Long id);
}
