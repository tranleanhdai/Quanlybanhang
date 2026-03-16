package com.example.demo.services.detailOrder;

import com.example.demo.entity.DetailOrder;

import java.util.List;
import java.util.Optional;

public interface detailOrderService {
    List<DetailOrder> getAllDetailOrders();
    Optional<DetailOrder> getDetailOrderById(Long id);
    List<DetailOrder> getDetailOrdersByOrderId(Long orderId);
    List<DetailOrder> getDetailOrdersByProductId(Long productId);
    DetailOrder createDetailOrder(DetailOrder detailOrder);
    DetailOrder updateDetailOrder(Long id, DetailOrder detailOrder);
    void deleteDetailOrder(Long id);
}
