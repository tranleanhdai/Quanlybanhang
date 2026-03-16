package com.example.demo.services.file;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public UploadResult uploadImage(MultipartFile file, String folder) throws Exception {
        Map<?, ?> res = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "folder", folder == null ? "uploads" : folder,
                "resource_type", "image",
                "use_filename", true,
                "unique_filename", true,
                "overwrite", false
            )
        );
        return new UploadResult(
            (String) res.get("secure_url"),
            (String) res.get("public_id")
        );
    }

    public record UploadResult(String url, String publicId) {}
}
