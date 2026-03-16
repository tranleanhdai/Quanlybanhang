package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Payment extends Base {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalPrice;

    private String method;             // "PAYOS"

    private boolean checkPayment;      // true nếu đã thanh toán

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;      // PENDING/PAID/FAILED/...

    @Column(unique = true)
    private String orderCode;          // mã đơn phía PayOS (duy nhất)

    private String provider = "PAYOS";
    @Lob
    private String checkoutUrl;
    @Lob
    private String qrUrl;             // fallback URL ảnh QR (dev)

    private String transactionId;      // mã giao dịch do PayOS trả về (nếu có)
    private Long expiredAt;            // epoch second

    @Lob
    private String rawPayload;         // lưu raw JSON lần tạo/nhận webhook (debug)

    @OneToOne
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;
}
