package com.example.demo.services.cart;

import com.example.demo.entity.Cart;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.cartRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class cartServiceIpm implements cartService {

    private final cartRepository cartRepository;

    @Override
    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    @Override
    public Optional<Cart> getCartById(Long id) {
        return cartRepository.findById(id);
    }

    @Override
    public List<Cart> getCartsByUserId(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    @Override
    public Cart createCart(Cart cart) {
        return cartRepository.save(cart);
    }

    @Override
    public Cart updateCart(Long id, Cart newCart) {
        return cartRepository.findById(id)
                .map(cart -> {
                    cart.setTotalPrice(newCart.getTotalPrice());
                    cart.setUser(newCart.getUser());
                    cart.setDetailCarts(newCart.getDetailCarts());
                    return cartRepository.save(cart);
                })
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));
    }

    @Override
    public void deleteCart(Long id) {
        if (!cartRepository.existsById(id)) {
            throw new AppException(ErrorCode.CART_NOT_FOUND);
        }
        cartRepository.deleteById(id);
    }
}
