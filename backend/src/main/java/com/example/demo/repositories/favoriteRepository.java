package com.example.demo.repositories;

import com.example.demo.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface favoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findAllByUserId(Long userId);

    long countByUserId(Long userId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);
}
