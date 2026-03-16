// backend/src/main/java/com/example/demo/entity/DetailOrder.java
package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "detail_orders")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DetailOrder extends Base {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quantity;
    private Double price;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore       // ✅ tránh vòng lặp Order → Detail → Order → ...
    private Order order;
}
