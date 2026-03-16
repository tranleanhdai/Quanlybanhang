package com.example.demo.utils.file;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class FileUpload {
    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.NO_FILE);
        }

        try {
            String contentType = file.getContentType();
            String resourceType = (contentType != null && contentType.startsWith("video")) ? "video" : "auto";
            String folder = resourceType.equals("video") ? "videos" : "images";

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", resourceType,
                            "folder", folder
                    ));

            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new AppException(ErrorCode.NO_UPLOAD_FILE);
        }
    }
}
