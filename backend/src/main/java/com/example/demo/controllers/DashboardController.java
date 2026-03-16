// backend/src/main/java/com/example/demo/controllers/DashboardController.java
package com.example.demo.controllers;

import com.example.demo.entity.Order;
import com.example.demo.entity.OrderStatus;
import com.example.demo.entity.User;
import com.example.demo.models.dtos.DashboardStatsDTO;
import com.example.demo.models.dtos.UserListDTO;
import com.example.demo.repositories.orderRepository;
import com.example.demo.repositories.productRepository;
import com.example.demo.repositories.userRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class DashboardController {

    private final userRepository userRepo;
    private final orderRepository orderRepo;
    private final productRepository productRepo;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        long users = userRepo.count();
        long orders = orderRepo.count();
        long products = productRepo.count();

        List<Order> paidOrders = orderRepo.findByStatus(OrderStatus.PAID);
        double revenue = paidOrders.stream()
                .mapToDouble(o -> o.getTotalPrice() == null ? 0d : o.getTotalPrice())
                .sum();

        DashboardStatsDTO dto = new DashboardStatsDTO(users, orders, revenue, products);
        return ResponseEntity.ok(dto);
    }

    // ⚡ NEW: trả danh sách user cho Dashboard
    @GetMapping("/users")
    public ResponseEntity<List<UserListDTO>> getUsers() {
        List<User> users = userRepo.findAll();

        List<UserListDTO> dtos = users.stream()
                .map(u -> new UserListDTO(
                        u.getId(),
                        u.getEmail(),
                        u.getName(),
                        u.getRole() != null ? u.getRole().name() : "USER"
                ))
                .toList();

        return ResponseEntity.ok(dtos);
    }
}
