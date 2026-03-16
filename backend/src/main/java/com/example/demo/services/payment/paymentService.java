// backend/src/main/java/com/example/demo/services/payment/paymentService.java
package com.example.demo.services.payment;

import java.util.Map;

public interface paymentService {

    // Tạo QR (link ảnh) cho Order
    Map<String, Object> createQrForOrder(Long orderId);

    // FE polling trạng thái thanh toán
    Map<String, Object> getPaymentStatus(Long orderId);

    // Webhook / IPN từ SePay (MBBank)
    void handleSepayIpn(Map<String, Object> body);
}
