package com.example.demo.repositories;

import com.example.demo.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ratingRepository extends JpaRepository<Rating,Long> {
    List<Rating> findByProductId(Long id);
    List<Rating> findByUserId(Long id);
}
