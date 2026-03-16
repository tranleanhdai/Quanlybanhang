package com.example.demo.services.order;

import com.example.demo.components.GetUserLogged;
import com.example.demo.entity.DetailOrder;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderStatus;
import com.example.demo.entity.User;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.detailOrderRepository;
import com.example.demo.repositories.orderRepository;
import com.example.demo.repositories.userRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import java.time.LocalDate;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
@Transactional
public class orderServiceIpm implements orderService {

    private final orderRepository orderRepository;
    private final userRepository userRepository;
    private final detailOrderRepository detailOrderRepository;
    private final GetUserLogged getUserLogged;

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    // Đơn đã thanh toán của user hiện tại
    @Override
    public List<Order> getMyPaidOrders() {
        User current = getUserLogged.getUser();
        return orderRepository.findByUserIdAndStatus(current.getId(), OrderStatus.PAID);
    }

    @Override
    public Order createOrder(Order order) {
        if (order == null) throw new AppException(ErrorCode.INVALID_PARAM);
        order.setId(null);

        // gắn user từ JWT (bắt buộc)
        User current = getUserLogged.getUser();
        order.setUser(current);

        // mặc định method nếu FE không gửi
        if (order.getMethod() == null || order.getMethod().isBlank()) {
            order.setMethod("PAYOS"); // hoặc "VNPAY" tuỳ bạn
        }

        // mặc định trạng thái PENDING nếu chưa set
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.PENDING);
        }

        // ====== TÁCH LIST DETAIL RA, CHÚT NỮA TỰ LƯU ======
        List<DetailOrder> detailList = null;
        if (order.getDetailOrders() != null && !order.getDetailOrders().isEmpty()) {
            detailList = order.getDetailOrders();
            // tạm bỏ khỏi order để tránh JPA cascade gây rối
            order.setDetailOrders(null);
        }

        // Lưu order trước để có ID
        Order saved = orderRepository.save(order);

        // ====== LƯU DETAIL_ORDERS TƯƠNG ỨNG ======
        if (detailList != null && !detailList.isEmpty()) {
            for (DetailOrder d : detailList) {
                d.setId(null);          // đảm bảo insert mới
                d.setOrder(saved);      // gắn order đã có id
            }
            detailOrderRepository.saveAll(detailList);
            saved.setDetailOrders(detailList); // gắn lại cho object trả về
        }

        // ====== TÍNH LẠI TOTAL_PRICE NẾU CẦN ======
        if (saved.getTotalPrice() == null || saved.getTotalPrice() <= 0) {
            double sum = 0d;

            if (detailList != null && !detailList.isEmpty()) {
                sum = detailList.stream()
                        .mapToDouble(d -> {
                            double price = d.getPrice() == null ? 0d : d.getPrice();
                            int qty = d.getQuantity() == null ? 0 : d.getQuantity();
                            return price * (double) qty;
                        })
                        .sum();
            } else {
                // fallback: lấy lại từ DB nếu vì lý do gì đó detailList null
                List<DetailOrder> details = detailOrderRepository.findByOrderId(saved.getId());
                sum = details.stream()
                        .mapToDouble(d -> {
                            double price = d.getPrice() == null ? 0d : d.getPrice();
                            int qty = d.getQuantity() == null ? 0 : d.getQuantity();
                            return price * (double) qty;
                        })
                        .sum();
            }

            if (sum > 0) {
                saved.setTotalPrice(sum);
                saved = orderRepository.save(saved);
            }
        }

        if (saved.getTotalPrice() == null || saved.getTotalPrice() <= 0) {
            throw new AppException(ErrorCode.INVALID_PARAM);
        }

        return saved;
    }

    @Override
    public Order updateOrder(Long id, Order newOrder) {
        return orderRepository.findById(id)
                .map(o -> {
                    if (newOrder.getTotalPrice() != null) {
                        o.setTotalPrice(newOrder.getTotalPrice());
                    }
                    if (newOrder.getMethod() != null && !newOrder.getMethod().isBlank()) {
                        o.setMethod(newOrder.getMethod());
                    }
                    if (newOrder.getDetailOrders() != null) {
                        o.setDetailOrders(newOrder.getDetailOrders());
                    }
                    // cho phép update status
                    if (newOrder.getStatus() != null) {
                        o.setStatus(newOrder.getStatus());
                    }
                    return orderRepository.save(o);
                })
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    @Override
    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        }
        orderRepository.deleteById(id);
    }
    @Override
        public List<Order> findOrdersForExport(LocalDate from, LocalDate to) {
            List<Order> all = orderRepository.findAll();

            if (from == null && to == null) return all;

            return all.stream()
                    .filter(o -> {
                        if (o.getCreatedAt() == null) return true;
                        LocalDate d = o.getCreatedAt().toLocalDate();
                        if (from != null && d.isBefore(from)) return false;
                        if (to != null && d.isAfter(to)) return false;
                        return true;
                    })
                    .collect(Collectors.toList());
        }
}
