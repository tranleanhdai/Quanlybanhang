package com.example.demo.models.dtos;
import lombok.AllArgsConstructor; import lombok.Data;

@Data @AllArgsConstructor
public class CreatePaymentResponseDTO {
    private String qrUrl;
    private String checkoutUrl;
    private String orderCode;
    private Long   expiredAt;
}
