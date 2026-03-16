package com.example.demo.services.detailOrder;

import com.example.demo.entity.DetailOrder;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.detailOrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class detailOrderServiceIpm implements detailOrderService {

    private final detailOrderRepository detailOrderRepository;

    @Override
    public List<DetailOrder> getAllDetailOrders() {
        return detailOrderRepository.findAll();
    }

    @Override
    public Optional<DetailOrder> getDetailOrderById(Long id) {
        return detailOrderRepository.findById(id);
    }

    @Override
    public List<DetailOrder> getDetailOrdersByOrderId(Long orderId) {
        return detailOrderRepository.findByOrderId(orderId);
    }

    @Override
    public List<DetailOrder> getDetailOrdersByProductId(Long productId) {
        return detailOrderRepository.findByProductId(productId);
    }

    @Override
    public DetailOrder createDetailOrder(DetailOrder detailOrder) {
        return detailOrderRepository.save(detailOrder);
    }

    @Override
    public DetailOrder updateDetailOrder(Long id, DetailOrder newDetailOrder) {
        return detailOrderRepository.findById(id)
                .map(detailOrder -> {
                    detailOrder.setQuantity(newDetailOrder.getQuantity());
                    detailOrder.setPrice(newDetailOrder.getPrice());
                    detailOrder.setOrder(newDetailOrder.getOrder());
                    detailOrder.setProduct(newDetailOrder.getProduct());
                    return detailOrderRepository.save(detailOrder);
                })
                .orElseThrow(() -> new AppException(ErrorCode.DETAIL_ORDER_NOT_FOUND));
    }

    @Override
    public void deleteDetailOrder(Long id) {
        if (!detailOrderRepository.existsById(id)) {
            throw new AppException(ErrorCode.DETAIL_ORDER_NOT_FOUND);
        }
        detailOrderRepository.deleteById(id);
    }
}
