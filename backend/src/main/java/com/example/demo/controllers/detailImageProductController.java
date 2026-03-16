package com.example.demo.controllers;

import com.example.demo.entity.DetailProductImage;
import com.example.demo.services.detailProductImage.detailProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/detail-product-image")
@RequiredArgsConstructor
public class detailImageProductController {

    private final detailProductImageService detailProductImageService;

    @GetMapping
    public List<DetailProductImage> getAllDetailProductImages() {
        return detailProductImageService.getAllImages();
    }

    @GetMapping("/{id}")
    public Optional<DetailProductImage> getDetailProductImageById(@PathVariable Long id) {
        return detailProductImageService.getImageById(id);
    }

    @GetMapping("/product/{productid}")
    public List<DetailProductImage> getImageByProductId(@PathVariable Long productid) {
        return detailProductImageService.getImagesByProductId(productid);
    }
    @PostMapping
    public DetailProductImage createDetailProductImage(@RequestBody DetailProductImage image) {
        return detailProductImageService.createImage(image);
    }

    @PutMapping("/{id}")
    public DetailProductImage updateDetailProductImage(@PathVariable Long id, @RequestBody DetailProductImage image) {
        return detailProductImageService.updateImage(id, image);
    }

    @DeleteMapping("/{id}")
    public void deleteDetailProductImage(@PathVariable Long id) {
        detailProductImageService.deleteImage(id);
    }
}
