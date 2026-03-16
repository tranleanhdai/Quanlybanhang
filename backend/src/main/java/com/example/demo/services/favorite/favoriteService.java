package com.example.demo.services.favorite;

import com.example.demo.entity.User;
import com.example.demo.models.dtos.FavoriteProductDTO;

import java.util.List;

public interface favoriteService {

    List<FavoriteProductDTO> getMyFavorites(User user);

    long countMyFavorites(User user);

    void addFavorite(User user, Long productId);

    void removeFavorite(User user, Long productId);
}
