package com.example.demo.repositories;

import com.example.demo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface paymentRepository extends JpaRepository<Payment,Long> {
    Optional<Payment> findByOrderId(Long Id);
}
