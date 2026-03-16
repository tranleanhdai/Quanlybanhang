// backend/src/main/java/com/example/demo/services/payment/paymentServiceIpm.java
package com.example.demo.services.payment;

import com.example.demo.entity.DetailOrder;
import com.example.demo.entity.Order;
import com.example.demo.entity.OrderStatus;
import com.example.demo.entity.Payment;
import com.example.demo.entity.PaymentStatus;
import com.example.demo.entity.Product;
import com.example.demo.repositories.detailOrderRepository;
import com.example.demo.repositories.orderRepository;
import com.example.demo.repositories.paymentRepository;
import com.example.demo.repositories.productRepository;
import com.example.demo.utils.sepay.SepaySignature;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class paymentServiceIpm implements paymentService {

    private final paymentRepository paymentRepo;
    private final orderRepository orderRepo;
    private final productRepository productRepo;
    private final detailOrderRepository detailOrderRepo;

    // Giữ lại để sau này cần verify checksum của SePay (tuỳ bạn dùng hay không)
    private final SepaySignature sepaySignature;

    /* =========================
       HÀM TRỪ TỒN KHO SẢN PHẨM
       ========================= */
    private void decreaseProductStock(Order order) {
        if (order == null || order.getId() == null) return;

        List<DetailOrder> details = detailOrderRepo.findByOrderId(order.getId());
        for (DetailOrder d : details) {
            Product p = d.getProduct();
            if (p == null) continue;

            int current = p.getQuantity();
            int qty = d.getQuantity() == null ? 0 : d.getQuantity();
            if (qty <= 0) continue;

            int newQty = current - qty;
            if (newQty < 0) newQty = 0;

            p.setQuantity(newQty);
            productRepo.save(p);
        }
    }

    /**
     * Tạo QR cho Order bằng SePay + MBBank
     */
    @Override
    public Map<String, Object> createQrForOrder(Long orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow();

        // Tạo (hoặc lấy) Payment gắn với Order
        Payment pay = paymentRepo.findByOrderId(orderId).orElseGet(() -> {
            Payment p = new Payment();
            p.setOrder(order);
            p.setMethod("SEPAY");          // Đánh dấu là thanh toán qua SePay
            p.setProvider("SEPAY_MBBANK"); // Tuỳ bạn đặt
            p.setStatus(PaymentStatus.PENDING);
            p.setTotalPrice(order.getTotalPrice());
            p.setCheckPayment(false);
            p.setCreatedAt(LocalDateTime.now());
            p.setUpdatedAt(LocalDateTime.now());
            return paymentRepo.save(p);
        });

        // Mã đơn cho SePay: ví dụ "DH65"
        String orderCode = "DH" + order.getId();
        pay.setOrderCode(orderCode);

        long amountVnd = Math.round(order.getTotalPrice() == null ? 0 : order.getTotalPrice());

        // ================== TẠO LINK QR SEPAY (MBBANK) ==================
        String accountNo = "0828820601"; // TK MBBank của bạn
        String desc = orderCode;         // nội dung chuyển khoản = "DH{orderId}"

        String encodedDesc = URLEncoder.encode(desc, StandardCharsets.UTF_8);
        String qrUrl = "https://qr.sepay.vn/img"
                + "?acc=" + accountNo
                + "&bank=MBBank"
                + "&amount=" + amountVnd
                + "&des=" + encodedDesc
                + "&template=compact";

        // Cho expired tạm 30 phút
        long expiredEpochSec = System.currentTimeMillis() / 1000 + 30 * 60;

        // Cập nhật Payment
        pay.setCheckoutUrl(qrUrl);          // FE sẽ dùng URL này như ảnh QR
        pay.setRawPayload(qrUrl);           // lưu log
        pay.setExpiredAt(expiredEpochSec);
        pay.setUpdatedAt(LocalDateTime.now());
        paymentRepo.save(pay);

        // Trả FE
        Map<String, Object> out = new HashMap<>();
        out.put("checkoutUrl", qrUrl);      // FE hiển thị QR từ đây
        out.put("expiredAt", expiredEpochSec);
        out.put("orderCode", pay.getOrderCode());  // "DH65"
        out.put("amount", amountVnd);
        out.put("addInfo", desc);           // nội dung chuyển khoản, nếu FE muốn show
        return out;
    }

    @Override
    public Map<String, Object> getPaymentStatus(Long orderId) {
        Payment pay = paymentRepo.findByOrderId(orderId).orElseThrow();

        Map<String, Object> out = new HashMap<>();
        out.put("status", pay.getStatus() != null ? pay.getStatus().name() : null);
        out.put("checkoutUrl", pay.getCheckoutUrl());
        out.put("orderCode", pay.getOrderCode());
        out.put("totalPrice", pay.getTotalPrice());
        out.put("checked", pay.isCheckPayment());
        out.put("expiredAt", pay.getExpiredAt());
        return out;
    }

    /**
     * IPN từ SePay (webhook MBBank)
     */
    @Override
    public void handleSepayIpn(Map<String, Object> body) {
        // Chỉ xử lý giao dịch TIỀN VÀO
        Object tt = body.get("transferType");
        if (tt == null || !"in".equalsIgnoreCase(tt.toString())) {
            return;
        }

        String content = body.get("content") != null ? body.get("content").toString() : null;
        if (content == null || content.isBlank()) return;

        // Tìm chuỗi dạng DH123 trong content
        Pattern pattern = Pattern.compile("(DH\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);
        if (!matcher.find()) {
            return; // không tìm thấy mã đơn, bỏ qua
        }
        String orderCode = matcher.group(1).toUpperCase(); // ví dụ "DH65"

        paymentRepo.findByOrderCode(orderCode).ifPresent(pay -> {

            // Nếu payment đã xử lý PAID rồi thì bỏ qua (tránh double-stock)
            if (pay.getStatus() == PaymentStatus.PAID && pay.isCheckPayment()) {
                return;
            }

            Order order = pay.getOrder();

            // Ở đây nếu bạn muốn, có thể dùng sepaySignature để verify checksum,
            // nhưng hiện tại chỉ map theo content.
            pay.setStatus(PaymentStatus.PAID);
            pay.setCheckPayment(true);
            if (order != null) {
                order.setStatus(OrderStatus.PAID);
                orderRepo.save(order);

                // ⭐ Trừ tồn kho khi SePay báo chuyển khoản thành công
                decreaseProductStock(order);
            }

            pay.setUpdatedAt(LocalDateTime.now());
            pay.setRawPayload(body.toString());
            paymentRepo.save(pay);
        });
    }
}
