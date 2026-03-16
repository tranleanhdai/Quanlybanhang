package com.example.demo.controllers;

import com.example.demo.components.GetUserLogged;
import com.example.demo.entity.User;
import com.example.demo.models.dtos.FavoriteProductDTO;
import com.example.demo.services.favorite.favoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class favoriteController {

    private final favoriteService favoriteService;
    private final GetUserLogged getUserLogged;

    /**
     * Lấy danh sách sản phẩm yêu thích của user hiện tại
     * GET /api/favorites
     */
    @GetMapping
    public List<FavoriteProductDTO> getMyFavorites() {
        User user = getUserLogged.getUser();
        return favoriteService.getMyFavorites(user);
    }

    /**
     * Đếm số sản phẩm yêu thích
     * GET /api/favorites/count
     */
    @GetMapping("/count")
    public Map<String, Long> countMyFavorites() {
        User user = getUserLogged.getUser();
        long count = favoriteService.countMyFavorites(user);
        Map<String, Long> res = new HashMap<>();
        res.put("count", count);
        return res;
    }

    /**
     * Thêm sản phẩm vào yêu thích
     * POST /api/favorites/{productId}
     */
    @PostMapping("/{productId}")
    public Map<String, Object> addFavorite(@PathVariable Long productId) {
        User user = getUserLogged.getUser();
        favoriteService.addFavorite(user, productId);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Added to favorites");
        return res;
    }

    /**
     * Xóa sản phẩm khỏi yêu thích
     * DELETE /api/favorites/{productId}
     */
    @DeleteMapping("/{productId}")
    public Map<String, Object> removeFavorite(@PathVariable Long productId) {
        User user = getUserLogged.getUser();
        favoriteService.removeFavorite(user, productId);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Removed from favorites");
        return res;
    }
}
