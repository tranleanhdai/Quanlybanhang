// backend/src/main/java/com/example/demo/controllers/PaymentController.java
package com.example.demo.controllers;

import com.example.demo.services.payment.paymentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final paymentService paymentService;

    /** FE gọi sau khi tạo Order: POST /api/payment/qr  body: { "orderId": 65 } */
    @PostMapping("/qr")
    public Map<String, Object> createQr(@RequestBody CreateQrBody body) {
        return paymentService.createQrForOrder(body.getOrderId());
    }

    /** FE polling: GET /api/payment/{orderId}/status */
    @GetMapping("/{orderId}/status")
    public Map<String, Object> getStatus(@PathVariable Long orderId) {
        return paymentService.getPaymentStatus(orderId);
    }

    /** IPN từ SePay (webhook MBBank) */
    @PostMapping("/sepay/ipn")
    public ResponseEntity<String> sepayIpn(@RequestBody Map<String, Object> body) {
        paymentService.handleSepayIpn(body);
        return ResponseEntity.ok("OK");
    }

    @Data
    public static class CreateQrBody {
        private Long orderId;
    }
}
