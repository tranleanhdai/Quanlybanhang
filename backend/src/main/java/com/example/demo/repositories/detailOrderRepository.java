package com.example.demo.repositories;

import com.example.demo.entity.DetailOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface detailOrderRepository extends JpaRepository<DetailOrder,Long> {
    List<DetailOrder> findByOrderId(Long id);
    List<DetailOrder> findByProductId(Long id);
}
