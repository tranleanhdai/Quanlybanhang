package com.example.demo.services.rating;

import com.example.demo.entity.Rating;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.ratingRepository;
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
                .orElseThrow(() ->  new AppException(ErrorCode.RATING_NOT_FOUND));
    }

    @Override
    public void deleteRating(Long id) {
        if (!ratingRepository.existsById(id)) {
            throw new AppException(ErrorCode.RATING_NOT_FOUND);
        }
        ratingRepository.deleteById(id);
    }
}
