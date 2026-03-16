package com.example.demo.services.favorite;

import com.example.demo.entity.Favorite;
import com.example.demo.entity.Product;
import com.example.demo.entity.User;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.models.dtos.FavoriteProductDTO;
import com.example.demo.repositories.favoriteRepository;
import com.example.demo.repositories.productRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class favoriteServiceIpm implements favoriteService {

    private final favoriteRepository favoriteRepository;
    private final productRepository productRepository;

    @Override
    public List<FavoriteProductDTO> getMyFavorites(User user) {
        return favoriteRepository.findAllByUserId(user.getId())
                .stream()
                .map(fav -> {
                    Product p = fav.getProduct();
                    return FavoriteProductDTO.builder()
                            .id(p.getId())
                            .name(p.getName())
                            .price(p.getPrice())
                            .imageURL(p.getImageURL())
                            .build();
                })
                .toList();
    }

    @Override
    public long countMyFavorites(User user) {
        return favoriteRepository.countByUserId(user.getId());
    }

    @Override
    public void addFavorite(User user, Long productId) {
        // đã tồn tại thì bỏ qua (idempotent)
        if (favoriteRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            return;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        Favorite favorite = Favorite.builder()
                .user(user)
                .product(product)
                .build();

        favoriteRepository.save(favorite);
    }

    @Override
    public void removeFavorite(User user, Long productId) {
        favoriteRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }
}
