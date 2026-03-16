package com.example.demo.services.detailProductImage;

import com.example.demo.entity.DetailProductImage;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.detailProductImageRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class detailProductImageServiceIpm implements detailProductImageService {

    private final detailProductImageRepository imageRepository;

    @Override
    public List<DetailProductImage> getAllImages() {
        return imageRepository.findAll();
    }

    @Override
    public Optional<DetailProductImage> getImageById(Long id) {
        return imageRepository.findById(id);
    }
    @Override
    public List<DetailProductImage> getImagesByProductId(Long productId) {
        return imageRepository.findByProductId(productId);
    }

    @Override
    public DetailProductImage createImage(DetailProductImage image) {
        return imageRepository.save(image);
    }

    @Override
    public DetailProductImage updateImage(Long id, DetailProductImage newImage) {
        return imageRepository.findById(id)
                .map(image -> {
                    image.setImageURL(newImage.getImageURL());
                    image.setProduct(newImage.getProduct());
                    return imageRepository.save(image);
                })
                .orElseThrow(() -> new AppException(ErrorCode.IMAGE_NOT_FOUND));
    }

    @Override
    public void deleteImage(Long id) {
        if (!imageRepository.existsById(id)) {
            throw new AppException(ErrorCode.IMAGE_NOT_FOUND);
        }
        imageRepository.deleteById(id);
    }
}
