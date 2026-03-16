package com.example.demo.services.rating;

import com.example.demo.entity.Rating;
import com.example.demo.models.dtos.RatingSummaryDTO;

import java.util.List;
import java.util.Optional;

public interface ratingService {

    List<Rating> getAllRatings();

    Optional<Rating> getRatingById(Long id);

    List<Rating> getRatingByUserId(Long userId);

    List<Rating> getRatingByProductId(Long productId);

    Rating createRating(Rating rating);

    Rating updateRating(Long id, Rating rating);

    void deleteRating(Long id);

    // ====== MỚI THÊM ======

    /**
     * Lấy thống kê rating (avg, count) theo productId
     */
    RatingSummaryDTO getSummaryByProductId(Long productId);

    /**
     * User đánh giá / cập nhật rating cho 1 product
     */
    Rating rateProduct(Long productId, int ratingValue, Long userId);
}
