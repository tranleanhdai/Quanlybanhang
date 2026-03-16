package com.example.demo.controllers;

import com.example.demo.entity.Rating;
import com.example.demo.services.rating.ratingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rating")
@RequiredArgsConstructor
public class ratingController {

    private final ratingService ratingService;

    @GetMapping
    public List<Rating> getAllRatings() {
        return ratingService.getAllRatings();
    }

    @GetMapping("/{id}")
    public Optional<Rating> getRatingById(@PathVariable Long id) {
        return ratingService.getRatingById(id);
    }

    @GetMapping("/user/{userid}")
    public List<Rating> getRatingByUserId(@PathVariable Long userid) {
        return ratingService.getRatingByUserId(userid);
    }
    @GetMapping("/product/{productid}")
    public List<Rating> getRatingByProductId(@PathVariable Long productid) {
        return ratingService.getRatingByProductId(productid);
    }
    @PostMapping
    public Rating createRating(@RequestBody Rating rating) {
        return ratingService.createRating(rating);
    }

    @PutMapping("/{id}")
    public Rating updateRating(@PathVariable Long id, @RequestBody Rating rating) {
        return ratingService.updateRating(id, rating);
    }

    @DeleteMapping("/{id}")
    public void deleteRating(@PathVariable Long id) {
        ratingService.deleteRating(id);
    }
}
