package com.example.demo.repositories;

import com.example.demo.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ratingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByProductId(Long id);

    List<Rating> findByUserId(Long id);

    // Tìm rating của 1 user cho 1 product (để update nếu đã tồn tại)
    Optional<Rating> findByUserIdAndProductId(Long userId, Long productId);
}
