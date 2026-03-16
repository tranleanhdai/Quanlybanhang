package com.example.demo.services.payment;

import com.example.demo.entity.Payment;

import java.util.List;
import java.util.Optional;

public interface paymentService {
    List<Payment> getAllPayments();
    Optional<Payment> getPaymentById(Long id);
    Optional<Payment> getPaymentByOrderId(Long orderId);
    Payment createPayment(Payment payment);
    Payment updatePayment(Long id, Payment payment);
    void deletePayment(Long id);
}
