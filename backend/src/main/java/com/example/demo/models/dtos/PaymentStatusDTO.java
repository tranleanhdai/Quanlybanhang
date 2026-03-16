package com.example.demo.models.dtos;
import lombok.AllArgsConstructor; import lombok.Data;
@Data @AllArgsConstructor
public class PaymentStatusDTO {
    private Long orderId;
    private String status;
}
