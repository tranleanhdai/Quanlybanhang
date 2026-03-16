package com.example.demo.controllers;

import com.example.demo.entity.DetailCart;
import com.example.demo.services.detailCart.detailCartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/detail_cart")
@RequiredArgsConstructor
public class detailCartController {

    private final detailCartService detailCartService;

    @GetMapping
    public List<DetailCart> getAllDetailCarts() {
        return detailCartService.getAllDetailCarts();
    }

    @GetMapping("/{id}")
    public Optional<DetailCart> getDetailCartById(@PathVariable Long id) {
        return detailCartService.getDetailCartById(id);
    }

    // ⚡ FIX chỗ này
    @GetMapping("/cartid/{cartid}")
    public List<DetailCart> getAllDetailCartsByCartId(@PathVariable("cartid") Long cartId) {
        return detailCartService.getDetailCartsByCartId(cartId);
    }

    @PostMapping
    public DetailCart createDetailCart(@RequestBody DetailCart detailCart) {
        return detailCartService.createDetailCart(detailCart);
    }

    @PutMapping("/{id}")
    public DetailCart updateDetailCart(@PathVariable Long id, @RequestBody DetailCart detailCart) {
        return detailCartService.updateDetailCart(id, detailCart);
    }

    @DeleteMapping("/{id}")
    public void deleteDetailCart(@PathVariable Long id) {
        detailCartService.deleteDetailCart(id);
    }
}
