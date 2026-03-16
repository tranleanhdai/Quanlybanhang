package com.example.demo.services.rating;

import com.example.demo.entity.Rating;

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
}
