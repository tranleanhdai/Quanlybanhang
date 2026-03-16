// backend/src/main/java/com/example/demo/repositories/paymentRepository.java
package com.example.demo.repositories;

import com.example.demo.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface paymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByOrderCode(String orderCode);

    @Query("select p from Payment p left join fetch p.order o order by p.id desc")
    List<Payment> findAllWithOrder();
}
