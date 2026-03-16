package com.example.demo.repositories;

import com.example.demo.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface cartRepository extends JpaRepository<Cart,Long> {
    List<Cart> findByUserId(long id);
}
