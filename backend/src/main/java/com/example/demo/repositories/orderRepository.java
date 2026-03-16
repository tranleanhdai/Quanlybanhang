package com.example.demo.repositories;

import com.example.demo.entity.Order;
import com.example.demo.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface orderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long id);

    // Lấy đơn theo user + trạng thái (đang dùng ở chỗ khác)
    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);

    // 👉 THÊM DÒNG NÀY cho Dashboard (revenue theo PAID)
    List<Order> findByStatus(OrderStatus status);
}
