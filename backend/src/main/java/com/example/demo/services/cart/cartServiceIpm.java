package com.example.demo.services.cart;

import com.example.demo.entity.Cart;
import com.example.demo.entity.User;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.cartRepository;
import com.example.demo.repositories.userRepository;
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
    private final userRepository userRepository;

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
    public Cart createCart(Long userId) {
        // tìm user và gán vào cart
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setTotalPrice(0D); // mặc định 0, sẽ được cập nhật bởi DetailCart service
        return cartRepository.save(cart);
    }

    @Override
    public Cart updateCart(Long id, Cart newCart) {
        return cartRepository.findById(id)
                .map(cart -> {
                    // total
                    if (newCart.getTotalPrice() != null) {
                        cart.setTotalPrice(newCart.getTotalPrice());
                    }
                    // vá cart cũ chưa có user
                    if (newCart.getUser() != null && newCart.getUser().getId() != null) {
                        User u = userRepository.findById(newCart.getUser().getId())
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                        cart.setUser(u);
                    }
                    // detailCarts nếu cần
                    if (newCart.getDetailCarts() != null) {
                        cart.setDetailCarts(newCart.getDetailCarts());
                    }
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
