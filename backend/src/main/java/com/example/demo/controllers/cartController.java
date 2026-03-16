package com.example.demo.controllers;

import com.example.demo.entity.Cart;
import com.example.demo.models.dtos.CartCreateDTO;
import com.example.demo.services.cart.cartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class cartController {

    private final cartService cartService;

    @GetMapping
    public List<Cart> getAllCarts() {
        return cartService.getAllCarts();
    }

    @GetMapping("/{id}")
    public Optional<Cart> getCartById(@PathVariable Long id) {
        return cartService.getCartById(id);
    }

    // tiện thêm endpoint lấy theo user
    @GetMapping("/user/{userId}")
    public List<Cart> getCartsByUser(@PathVariable Long userId) {
        return cartService.getCartsByUserId(userId);
    }

    @PostMapping
    public Cart createCart(@RequestBody CartCreateDTO dto) {
        return cartService.createCart(dto.getUserId());
    }

    @PutMapping("/{id}")
    public Cart updateCart(@PathVariable Long id, @RequestBody Cart cart) {
        return cartService.updateCart(id, cart);
    }

    @DeleteMapping("/{id}")
    public void deleteCart(@PathVariable Long id) {
        cartService.deleteCart(id);
    }
}
