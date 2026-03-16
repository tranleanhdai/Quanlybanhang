package com.example.demo.models.dtos;
import lombok.Data;

@Data
public class PayOSWebhookDTO {
    private String code;            // orderCode (theo PayOS)
    private String transactionId;   // mã giao dịch/payos
    private Long   amount;
    private String description;
    private String status;          // "PAID"/"CANCELED"/"FAILED"...
    private Long   time;

    // chữ ký PayOS (tên header/field có thể khác nhau; ta hỗ trợ cả body lẫn header)
    private String signature;
}
