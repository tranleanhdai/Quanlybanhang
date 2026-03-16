package com.example.demo.controllers;

import com.example.demo.models.responses.ApiResponse;
import com.example.demo.services.file.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<?> upload(@RequestParam("file") MultipartFile file,
                                 @RequestParam(value = "folder", required = false) String folder) throws Exception {
        var r = cloudinaryService.uploadImage(file, folder);
        return ApiResponse.builder()
                .httpStatus(HttpStatus.OK)
                .message("Uploaded")
                .data(r)
                .build();
    }
}
