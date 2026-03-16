package com.example.demo.repositories;

import com.example.demo.entity.DetailCart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface detailCartRepository extends JpaRepository<DetailCart,Long> {
    List<DetailCart> findByCartId(long id);
    List<DetailCart> findByProductId(long id);
}
