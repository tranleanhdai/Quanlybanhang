package com.example.demo.models.dtos;
import lombok.Data;

@Data
public class CreatePaymentRequestDTO {
    private Long orderId;       // bắt buộc
}
