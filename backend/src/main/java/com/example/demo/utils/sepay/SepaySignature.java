package com.example.demo.utils.sepay;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SepaySignature {

    @Value("${sepay.secret-key}")
    private String secretKey;

    /**
     * TODO: chỉnh lại đúng công thức của SePay theo tài liệu.
     * Hiện tại mình để skeleton: sort key, nối "key=value" + secret rồi md5.
     */
    public boolean isValid(Map<String, String> data, String receivedChecksum) {
        try {
            // bỏ checksum ra khỏi map trước khi tính
            Map<String, String> filtered = data.entrySet().stream()
                    .filter(e -> !"checksum".equalsIgnoreCase(e.getKey()))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            String raw = filtered.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining("&"));

            raw = raw + secretKey; // tuỳ spec SePay

            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b & 0xff));
            }
            String calc = sb.toString();

            return calc.equalsIgnoreCase(receivedChecksum);
        } catch (Exception e) {
            return false;
        }
    }
}
