package com.example.demo.services.product;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.demo.entity.Category;
import com.example.demo.entity.Product;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.categoryRepository;
import com.example.demo.repositories.productRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDResources;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class productServiceIpm implements productService {

    private final productRepository productRepository;
    private final categoryRepository categoryRepository;
    private final Cloudinary cloudinary;

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(Long id, Product newProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(newProduct.getName());
                    product.setDescription(newProduct.getDescription());
                    product.setQuantity(newProduct.getQuantity());
                    product.setImageURL(newProduct.getImageURL());
                    product.setPrice(newProduct.getPrice());
                    product.setCategory(newProduct.getCategory());
                    product.setImages(newProduct.getImages());
                    product.setRatings(newProduct.getRatings());
                    product.setDetailCarts(newProduct.getDetailCarts());
                    product.setDetailOrders(newProduct.getDetailOrders());
                    product.setCatalogs(newProduct.getCatalogs());
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        productRepository.deleteById(id);
    }

    // =====================================================
    //          IMPORT PRODUCT FROM PDF (CÁCH 2)
    // =====================================================

    @Override
    public Product importProductFromPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        try (PDDocument doc = PDDocument.load(file.getInputStream())) {

            // 1. Lấy toàn bộ text trong PDF
            String text = extractText(doc);

            // 2. Parse text theo từng dòng "Label: Value"
            Map<String, String> fields = parseFields(text);

            // 3. Map vào Product
            String name = fields.getOrDefault("Tên sản phẩm", "");
            String priceStr = fields.getOrDefault("Giá (VND)", "0");
            String quantityStr = fields.getOrDefault("Số lượng", "0");
            String categoryName = fields.getOrDefault("Danh mục", null);
            String description = fields.getOrDefault("Mô tả", "");

            if (name.isBlank()) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }

            double price;
            try {
                price = Double.parseDouble(
                        priceStr.replace(".", "")
                                .replace(",", "")
                                .trim()
                );
            } catch (NumberFormatException e) {
                price = 0D;
            }

            int quantity;
            try {
                quantity = Integer.parseInt(quantityStr.trim());
            } catch (NumberFormatException e) {
                quantity = 0;
            }

            Category category = null;
            if (categoryName != null && !categoryName.isBlank()) {
                category = categoryRepository
                        .findByNameIgnoreCase(categoryName.trim())
                        .orElseGet(() -> {
                            Category c = new Category();
                            c.setName(categoryName.trim());
                            return categoryRepository.save(c);
                        });
            }

            // 4. Lấy ảnh đầu tiên trong PDF, upload Cloudinary -> url
            String imageUrl = extractAndUploadFirstImage(doc);

            Product product = Product.builder()
                    .name(name)
                    .description(description)
                    .quantity(quantity)
                    .price(price)
                    .imageURL(imageUrl)
                    .category(category)
                    .build();

            return productRepository.save(product);

        } catch (IOException e) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    // -------- Helpers cho PDF --------

    private String extractText(PDDocument doc) throws IOException {
        org.apache.pdfbox.text.PDFTextStripper stripper =
                new org.apache.pdfbox.text.PDFTextStripper();
        return stripper.getText(doc);
    }

    /**
     * Parse dạng:
     * "Tên sản phẩm: iPhone 15 Pro Max 256GB"
     * "Giá (VND): 32990000"
     * ...
     */
    private Map<String, String> parseFields(String text) {
        Map<String, String> map = new HashMap<>();
        if (text == null) return map;

        String[] lines = text.split("\\r?\\n");
        for (String raw : lines) {
            String line = raw.trim();
            if (line.isEmpty()) continue;

            int idx = line.indexOf(':');
            if (idx < 0) continue;

            String label = line.substring(0, idx).trim();
            String value = line.substring(idx + 1).trim();
            if (!label.isEmpty()) {
                map.put(label, value);
            }
        }
        return map;
    }

    /**
     * Tìm ảnh đầu tiên trong PDF, upload lên Cloudinary folder "products-pdf"
     * Nếu không có ảnh -> return null.
     */
    private String extractAndUploadFirstImage(PDDocument doc) {
        BufferedImage image = null;

        try {
            outer:
            for (PDPage page : doc.getPages()) {
                PDResources resources = page.getResources();
                if (resources == null) continue;

                for (org.apache.pdfbox.cos.COSName name : resources.getXObjectNames()) {
                    PDXObject xObject = resources.getXObject(name);
                    if (xObject instanceof PDImageXObject) {
                        image = ((PDImageXObject) xObject).getImage();
                        break outer;
                    }
                }
            }

            if (image == null) {
                // Không có ảnh trong PDF
                return null;
            }

            // Convert BufferedImage -> byte[] (JPEG)
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "jpg", baos);
            baos.flush();
            byte[] bytes = baos.toByteArray();

            // Upload Cloudinary
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    bytes,
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "folder", "products-pdf"
                    )
            );

            Object url = uploadResult.get("secure_url");
            if (url == null) {
                url = uploadResult.get("url");
            }
            return url != null ? url.toString() : null;

        } catch (Exception e) {
            // Nếu lỗi upload hoặc không đọc được ảnh -> không chặn tạo product, chỉ bỏ ảnh
            return null;
        }
    }

    // =====================================================
    //          RELATED PRODUCTS
    // =====================================================

    @Override
    public List<Product> getRelatedProducts(Long productId, int limit) {
        Product base = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        List<Product> related;

        if (base.getCategory() != null && base.getCategory().getId() != null) {
            related = productRepository.findRelatedProducts(
                    base.getCategory().getId(),
                    base.getId()
            );
        } else {
            // fallback: không có category thì lấy random top 10 (trừ chính nó)
            related = productRepository.findTop10ByIdIsNotOrderByIdDesc(base.getId());
        }

        if (limit > 0 && related.size() > limit) {
            return related.subList(0, limit);
        }
        return related;
    }
}
