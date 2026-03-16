package com.example.demo.controllers;

import com.example.demo.components.GetUserLogged;
import com.example.demo.entity.Cart;
import com.example.demo.entity.DetailCart;
import com.example.demo.entity.DetailOrder;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderStatus;
import com.example.demo.entity.User;
import com.example.demo.repositories.cartRepository;
import com.example.demo.repositories.detailCartRepository;
import com.example.demo.services.order.orderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class orderController {

    private final orderService orderService;
    private final GetUserLogged getUserLogged;
    private final cartRepository cartRepository;
    private final detailCartRepository detailCartRepository;

    // ================== CRUD cơ bản ==================

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public Optional<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @GetMapping("/user/{userid}")
    public List<Order> getOrdersByUserId(@PathVariable Long userid) {
        return orderService.getOrdersByUserId(userid);
    }

    // Đơn đã thanh toán của user hiện tại
    @GetMapping("/my-paid")
    public List<Order> getMyPaidOrders() {
        return orderService.getMyPaidOrders();
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderService.createOrder(order);
    }

    @PutMapping("/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestBody Order order) {
        return orderService.updateOrder(id, order);
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }

    // ================== Tạo Order từ giỏ hàng hiện tại ==================

    @PostMapping("/create-from-cart")
    public Order createFromCart(@RequestBody CreateFromCartBody body) {
        // 1. Lấy user hiện tại
        User user = getUserLogged.getUser();

        // 2. Lấy tất cả cart của user
        List<Cart> carts = cartRepository.findByUserId(user.getId());
        if (carts == null || carts.isEmpty()) {
            throw new RuntimeException("Cart not found for user");
        }

        // 3. TÌM CART CÓ ITEM (detail_cart) – tránh lấy nhầm cart trống
        Cart selectedCart = null;
        List<DetailCart> cartItems = null;

        for (Cart c : carts) {
            List<DetailCart> items = detailCartRepository.findByCartId(c.getId());
            if (items != null && !items.isEmpty()) {
                selectedCart = c;
                cartItems = items;
                break;
            }
        }

        if (selectedCart == null || cartItems == null || cartItems.isEmpty()) {
            // THẬT SỰ không có cart nào có item
            throw new RuntimeException("Cart is empty");
        }

        // 4. Tạo Order "thô"
        Order order = new Order();
        order.setMethod(
                body.getMethod() == null || body.getMethod().isBlank()
                        ? "SEPAY"
                        : body.getMethod()
        );
        order.setStatus(OrderStatus.PENDING);
        order.setDetailOrders(new ArrayList<>());

        // 5. Map từng DetailCart => DetailOrder + TÍNH LẠI TOTAL
        double total = 0d;

        for (DetailCart dc : cartItems) {
            DetailOrder d = new DetailOrder();
            d.setOrder(order);
            d.setProduct(dc.getProduct());
            d.setPrice(dc.getPrice());
            d.setQuantity(dc.getQuantity());

            total += dc.getPrice() * dc.getQuantity();
            order.getDetailOrders().add(d);
        }

        order.setTotalPrice(total);

        // 6. Lưu order qua service (gắn user + lưu detailOrders)
        Order saved = orderService.createOrder(order);

        // 7. CLEAR GIỎ HÀNG sau khi đã tạo đơn
        detailCartRepository.deleteAll(cartItems);
        selectedCart.setTotalPrice(0D);
        cartRepository.save(selectedCart);

        return saved;
    }

    // ================== DTO body ==================

    @Data
    public static class CreateFromCartBody {
        private Double totalPrice;
        private String method;
    }
     @GetMapping("/export")
    public void exportOrdersToCsv(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletResponse response
    ) throws IOException {

        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=orders.csv");

        var orders = orderService.findOrdersForExport(from, to);

        try (PrintWriter writer = response.getWriter()) {
            writer.println("OrderId,UserEmail,TotalPrice,Method,Status,CreatedAt");

            for (Order o : orders) {
                String email = o.getUser() != null ? o.getUser().getEmail() : "";
                double total = o.getTotalPrice() != null ? o.getTotalPrice() : 0d;
                String method = o.getMethod() != null ? o.getMethod() : "";
                String status = o.getStatus() != null ? o.getStatus().name() : "";
                String created = o.getCreatedAt() != null ? o.getCreatedAt().toString() : "";

                // tránh dấu phẩy phá format
                email = email.replace(",", " ");

                writer.printf(
                        "%d,%s,%.0f,%s,%s,%s%n",
                        o.getId(),
                        email,
                        total,
                        method,
                        status,
                        created
                );
            }
        }
    }
}
