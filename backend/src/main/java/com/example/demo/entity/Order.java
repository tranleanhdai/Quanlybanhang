// backend/src/main/java/com/example/demo/entity/Order.java
package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Order extends Base {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalPrice;

    private String method;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // ✅ CHO PHÉP TRẢ RA CHO FE
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<DetailOrder> detailOrders;

    // ✅ Vẫn giữ lại Payment cho FE
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment;
}
