package com.example.demo.services.rating;

import com.example.demo.entity.Product;
import com.example.demo.entity.Rating;
import com.example.demo.entity.User;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.models.dtos.RatingSummaryDTO;
import com.example.demo.repositories.productRepository;
import com.example.demo.repositories.ratingRepository;
import com.example.demo.repositories.userRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class ratingServiceIpm implements ratingService {

    private final ratingRepository ratingRepository;
    private final userRepository userRepository;
    private final productRepository productRepository;

    @Override
    public List<Rating> getAllRatings() {
        return ratingRepository.findAll();
    }

    @Override
    public Optional<Rating> getRatingById(Long id) {
        return ratingRepository.findById(id);
    }

    @Override
    public List<Rating> getRatingByUserId(Long userId) {
        return ratingRepository.findByUserId(userId);
    }

    @Override
    public List<Rating> getRatingByProductId(Long productId) {
        return ratingRepository.findByProductId(productId);
    }

    @Override
    public Rating createRating(Rating rating) {
        return ratingRepository.save(rating);
    }

    @Override
    public Rating updateRating(Long id, Rating newRating) {
        return ratingRepository.findById(id)
                .map(rating -> {
                    rating.setRating(newRating.getRating());
                    rating.setUser(newRating.getUser());
                    rating.setProduct(newRating.getProduct());
                    return ratingRepository.save(rating);
                })
                .orElseThrow(() -> new AppException(ErrorCode.RATING_NOT_FOUND));
    }

    @Override
    public void deleteRating(Long id) {
        if (!ratingRepository.existsById(id)) {
            throw new AppException(ErrorCode.RATING_NOT_FOUND);
        }
        ratingRepository.deleteById(id);
    }

    // ================== MỚI THÊM ==================

    @Override
    public RatingSummaryDTO getSummaryByProductId(Long productId) {
        List<Rating> ratings = ratingRepository.findByProductId(productId);
        if (ratings.isEmpty()) {
            return RatingSummaryDTO.builder()
                    .avg(0.0)
                    .count(0L)
                    .build();
        }

        double avg = ratings.stream()
                .mapToInt(Rating::getRating)
                .average()
                .orElse(0.0);

        long count = ratings.size();

        return RatingSummaryDTO.builder()
                .avg(avg)
                .count(count)
                .build();
    }

    @Override
    public Rating rateProduct(Long productId, int ratingValue, Long userId) {
        if (ratingValue < 1 || ratingValue > 5) {
            throw new AppException(ErrorCode.INVALID_PARAM);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Nếu user đã rating sản phẩm này thì update, ngược lại tạo mới
        Rating rating = ratingRepository
                .findByUserIdAndProductId(userId, productId)
                .orElseGet(() -> {
                    Rating r = new Rating();
                    r.setUser(user);
                    r.setProduct(product);
                    return r;
                });

        rating.setRating(ratingValue);

        return ratingRepository.save(rating);
    }
}
