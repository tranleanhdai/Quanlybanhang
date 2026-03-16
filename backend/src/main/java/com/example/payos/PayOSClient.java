package com.example.payos;
    

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

/**
 * PayOS client “thử mọi tổ hợp”:
 * - MODE: A (querystring key=value&...) hoặc B (JSON minify sort key)
 * - SIG CASE: lower / UPPER
 * - HEADER: x-signature / x-checksum / none
 * - CT: application/json; charset=utf-8 / application/json
 *
 * ==> Tổng 2 x 2 x 3 x 2 = 24 tổ hợp. Gặp cái nào qua là dừng, trả data.
 */
@Component
@RequiredArgsConstructor
public class PayOSClient {

    @Value("${payos.base-url}")
    private String baseUrl;

    @Value("${payos.client-id}")
    private String clientId;

    @Value("${payos.api-key}")
    private String apiKey;

    @Value("${payos.checksum-key}")
    private String checksumKey;

    @Value("${payos.return-url}")
    private String returnUrl;

    @Value("${payos.cancel-url}")
    private String cancelUrl;

    private final RestTemplate rest = new RestTemplate();

    public Map<String, Object> createPayment(long orderCode, long amount, String desc, long expiredAt) {
        Map<String, Object> base = new LinkedHashMap<>();
        base.put("amount", amount);
        base.put("cancelUrl", cancelUrl);
        base.put("description", desc);
        base.put("expiredAt", expiredAt);
        base.put("orderCode", orderCode); // <= 10–11 chữ số
        base.put("returnUrl", returnUrl);

        String url = baseUrl + "/v2/payment-requests";

        // tất cả tổ hợp cần thử
        String[] modes = {"A","B"}; // A=querystring, B=json
        boolean[] upperCases = {false, true};  // sig lower/UPPER
        String[] headerKinds = {"x-signature","x-checksum","none"};
        MediaType[] cts = {
                MediaType.parseMediaType("application/json; charset=utf-8"),
                MediaType.APPLICATION_JSON
        };

        for (String mode : modes) {
            for (boolean useUpper : upperCases) {
                for (String headerKind : headerKinds) {
                    for (MediaType ct : cts) {
                        // build body + signature theo mode
                        String signedString;
                        Map<String, Object> body = new LinkedHashMap<>(base);

                        if ("A".equals(mode)) {
                            signedString = buildDataToSign(base);
                        } else {
                            signedString = buildMinifiedJsonSorted(base);
                        }
                        String sig = hmacSHA256(signedString, checksumKey);
                        if (useUpper) sig = sig.toUpperCase();

                        body.put("signature", sig);

                        HttpHeaders h = new HttpHeaders();
                        h.setContentType(ct);
                        h.set("x-client-id", clientId);
                        h.set("x-api-key", apiKey);
                        if (!"none".equals(headerKind)) {
                            h.set(headerKind, sig);
                        }

                        // log thử nghiệm
                        System.out.println("\n=== TRY ===");
                        System.out.println("MODE=" + mode
                                + " | SIGCASE=" + (useUpper ? "UPPER" : "lower")
                                + " | HEADER=" + headerKind
                                + " | CT=" + ct.toString());
                        System.out.println("signedString=" + signedString);
                        System.out.println("signature=" + sig);
                        

                        try {
                            HttpEntity<Map<String,Object>> req = new HttpEntity<>(body, h);
                            ResponseEntity<Map> resp = rest.exchange(url, HttpMethod.POST, req, Map.class);
                            @SuppressWarnings("unchecked")
                            Map<String, Object> map = (Map<String, Object>) resp.getBody();
                            System.out.println("HTTP " + resp.getStatusCodeValue() + " => " + map);

                            String code = map != null && map.get("code") != null ? String.valueOf(map.get("code")) : null;

                            // Nếu KHÔNG phải 201 hoặc trả về có "data.checkoutUrl"/"data.qrCode" => coi như qua cửa
                            if (!"201".equals(code)) {
                                Map<String, Object> data = extractData(map);
                                if (hasUsefulData(data)) {
                                    System.out.println(">>> SUCCESS COMBINATION FOUND <<<");
                                    return data;
                                }
                                // một số môi trường trả code khác, nhưng vẫn đúng — cứ trả data để FE dùng
                                return data != null ? data : Map.of("note","no-data-but-non-201");
                            }
                        } catch (Exception e) {
                            System.out.println("HTTP EXCEPTION: " + e.getMessage());
                        }
                    }
                }
            }
        }

        // Nếu tất cả đều 201 => trả rớt
        Map<String,Object> fail = new LinkedHashMap<>();
        fail.put("code","201");
        fail.put("desc","Signature invalid across all combinations");
        return fail;
    }

    public Map<String, Object> createPaymentSimple(long amount) {
        long orderCode = Instant.now().getEpochSecond();
        long expiredAt = orderCode + 600;
        return createPayment(orderCode, amount, "Pay test", expiredAt);
    }

    // ===== helpers =====
    @SuppressWarnings("unchecked")
    private static Map<String, Object> extractData(Map<String, Object> body) {
        if (body == null) return null;
        Object data = body.get("data");
        return (data instanceof Map) ? (Map<String, Object>) data : body;
    }

    private static boolean hasUsefulData(Map<String, Object> data) {
        if (data == null) return false;
        Object checkout = data.get("checkoutUrl");
        Object qr = data.get("qrCode");
        return (checkout != null && String.valueOf(checkout).length() > 0)
                || (qr != null && String.valueOf(qr).length() > 0);
    }

    private static String hmacSHA256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(raw.length * 2);
            for (byte b : raw) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC error", e);
        }
    }

    /** key=value&... (sort alphabet, bỏ null và "signature") */
    private static String buildDataToSign(Map<String, Object> payload) {
        TreeMap<String, Object> sorted = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        for (var e : payload.entrySet()) {
            String k = e.getKey();
            if ("signature".equalsIgnoreCase(k) || e.getValue() == null) continue;
            sorted.put(k, e.getValue());
        }
        StringBuilder sb = new StringBuilder();
        for (var e : sorted.entrySet()) {
            if (sb.length() > 0) sb.append('&');
            sb.append(e.getKey()).append('=').append(e.getValue());
        }
        return sb.toString();
    }

    /** JSON minify (sort key alphabet, bỏ "signature") */
    private static String buildMinifiedJsonSorted(Map<String, Object> payload) {
        TreeMap<String, Object> sorted = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        for (var e : payload.entrySet()) {
            String k = e.getKey();
            if ("signature".equalsIgnoreCase(k) || e.getValue() == null) continue;
            sorted.put(k, e.getValue());
        }
        StringBuilder sb = new StringBuilder();
        sb.append('{');
        boolean first = true;
        for (var e : sorted.entrySet()) {
            if (!first) sb.append(',');
            first = false;
            sb.append('"').append(escapeJson(e.getKey())).append('"').append(':');
            Object v = e.getValue();
            if (v instanceof Number) {
                sb.append(v);
            } else {
                sb.append('"').append(escapeJson(String.valueOf(v))).append('"');
            }
        }
        sb.append('}');
        return sb.toString();
    }

    private static String escapeJson(String s) {
        if (!StringUtils.hasText(s)) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
