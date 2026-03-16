package com.example.demo.services.detailCart;

import com.example.demo.entity.Cart;
import com.example.demo.entity.DetailCart;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.cartRepository;
import com.example.demo.repositories.detailCartRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class detailCartServiceIpm implements detailCartService {

    private final detailCartRepository detailCartRepository;
    private final cartRepository cartRepository;

    @Override
    public List<DetailCart> getAllDetailCarts() {
        return detailCartRepository.findAll();
    }

    @Override
    public Optional<DetailCart> getDetailCartById(Long id) {
        return detailCartRepository.findById(id);
    }

    @Override
    public List<DetailCart> getDetailCartsByCartId(Long cartId) {
        return detailCartRepository.findByCartId(cartId);
    }

    @Override
    public List<DetailCart> getDetailCartsByProductId(Long productId) {
        return detailCartRepository.findByProductId(productId);
    }

    @Override
    public DetailCart createDetailCart(DetailCart detailCart) {
        // FE đã gửi dạng nested { cart:{id}, product:{id}, quantity, price }
        DetailCart saved = detailCartRepository.save(detailCart);
        // cập nhật tổng tiền của cart ngay sau khi tạo
        recalcCartTotal(saved.getCart() != null ? saved.getCart().getId() : null);
        return saved;
    }

    @Override
    public DetailCart updateDetailCart(Long id, DetailCart newDetailCart) {
        DetailCart saved = detailCartRepository.findById(id)
                .map(dc -> {
                    // cập nhật các trường được phép
                    dc.setQuantity(newDetailCart.getQuantity());
                    if (newDetailCart.getPrice() != null) {
                        dc.setPrice(newDetailCart.getPrice());
                    }
                    if (newDetailCart.getCart() != null) {
                        dc.setCart(newDetailCart.getCart());
                    }
                    if (newDetailCart.getProduct() != null) {
                        dc.setProduct(newDetailCart.getProduct());
                    }
                    return detailCartRepository.save(dc);
                })
                .orElseThrow(() -> new AppException(ErrorCode.DETAIL_CART_NOT_FOUND));

        // cập nhật tổng tiền cho cart sau khi sửa
        recalcCartTotal(saved.getCart() != null ? saved.getCart().getId() : null);
        return saved;
    }

    @Override
    public void deleteDetailCart(Long id) {
        detailCartRepository.findById(id).ifPresent(dc -> {
            Long cartId = dc.getCart() != null ? dc.getCart().getId() : null;
            detailCartRepository.delete(dc);
            // cập nhật tổng tiền cho cart sau khi xoá
            recalcCartTotal(cartId);
        });
    }

    /** ----------------- Helper: tính lại tổng tiền của cart ----------------- */
    private void recalcCartTotal(Long cartId) {
        if (cartId == null) return;

        // Lấy tất cả chi tiết thuộc cart và tính tổng quantity * price
        List<DetailCart> items = detailCartRepository.findByCartId(cartId);
        double sum = 0D;
        for (DetailCart it : items) {
            double price = it.getPrice() != null ? it.getPrice() : 0D;
            int qty = it.getQuantity();
            sum += price * qty;
        }

        Cart cart = cartRepository.findById(cartId).orElse(null);
        if (cart != null) {
            cart.setTotalPrice(sum);
            cartRepository.save(cart);
        }
    }
}
