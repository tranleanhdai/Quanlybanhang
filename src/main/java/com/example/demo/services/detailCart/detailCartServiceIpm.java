package com.example.demo.services.detailCart;

import com.example.demo.entity.DetailCart;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
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
        return detailCartRepository.save(detailCart);
    }

    @Override
    public DetailCart updateDetailCart(Long id, DetailCart newDetailCart) {
        return detailCartRepository.findById(id)
                .map(detailCart -> {
                    detailCart.setQuantity(newDetailCart.getQuantity());
                    detailCart.setPrice(newDetailCart.getPrice());
                    detailCart.setCart(newDetailCart.getCart());
                    detailCart.setProduct(newDetailCart.getProduct());
                    return detailCartRepository.save(detailCart);
                })
                .orElseThrow(() -> new AppException(ErrorCode.DETAIL_CART_NOT_FOUND));
    }

    @Override
    public void deleteDetailCart(Long id) {
        if (!detailCartRepository.existsById(id)) {
            throw new AppException(ErrorCode.DETAIL_CART_NOT_FOUND);
        }
        detailCartRepository.deleteById(id);
    }
}
