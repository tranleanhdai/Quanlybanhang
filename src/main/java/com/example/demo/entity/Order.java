    package com.example.demo.entity;

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

        @ManyToOne
        @JoinColumn(name = "user_id")
        private User user;

        @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
        private List<DetailOrder> detailOrders;

        @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
        private Payment payment;
    }
