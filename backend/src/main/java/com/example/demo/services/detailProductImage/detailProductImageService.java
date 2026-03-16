package com.example.demo.services.detailProductImage;

import com.example.demo.entity.DetailProductImage;

import java.util.List;
import java.util.Optional;

public interface detailProductImageService {
    List<DetailProductImage> getAllImages();
    Optional<DetailProductImage> getImageById(Long id);
    DetailProductImage createImage(DetailProductImage image);
    DetailProductImage updateImage(Long id, DetailProductImage image);
    void deleteImage(Long id);
    List<DetailProductImage> getImagesByProductId(Long productId);
}
