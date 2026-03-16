package com.example.demo.services.payment;

import com.example.demo.entity.Payment;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.paymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class paymentServiceIpm implements paymentService {

    private final paymentRepository paymentRepository;

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    @Override
    public Optional<Payment> getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    @Override
    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Override
    public Payment updatePayment(Long id, Payment newPayment) {
        return paymentRepository.findById(id)
                .map(payment -> {
                    payment.setTotalPrice(newPayment.getTotalPrice());
                    payment.setMethod(newPayment.getMethod());
                    payment.setCheckPayment(newPayment.isCheckPayment());
                    payment.setOrder(newPayment.getOrder());
                    return paymentRepository.save(payment);
                })
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
    }

    @Override
    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new AppException(ErrorCode.PAYMENT_NOT_FOUND);
        }
        paymentRepository.deleteById(id);
    }
}
