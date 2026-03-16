package com.example.demo.services.order;

import com.example.demo.entity.Order;

import java.util.List;
import java.util.Optional;

public interface orderService {
    List<Order> getAllOrders();
    Optional<Order> getOrderById(Long id);
    List<Order> getOrdersByUserId(Long userId);
    Order createOrder(Order order);
    Order updateOrder(Long id, Order order);
    void deleteOrder(Long id);
}
