package com.example.demo.filter;

import com.example.demo.components.JwtTokenUtils;
import com.example.demo.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {

    private final String apiPrefix = "/api";
    private final UserDetailsService userDetailsService;
    private final JwtTokenUtils jwtTokenUtil;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String path = request.getServletPath();
            String method = request.getMethod();

            // Không áp dụng cho non-API, ws, sign
            if (!path.startsWith(apiPrefix) && !path.startsWith("/ws") && !path.startsWith("/sign")) {
                filterChain.doFilter(request, response);
                return;
            }

            // BYPASS các endpoint công khai (PayOS webhook, status, qr, auth…)
            if (isBypassToken(request)) {
                filterChain.doFilter(request, response);
                return;
            }

            // KHÔNG ép 401 khi không có Bearer: cho qua để Security layer quyết định
            final String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            final String token = authHeader.substring(7);
            final String username = jwtTokenUtil.getSubject(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                User userDetails = (User) userDetailsService.loadUserByUsername(username);
                if (jwtTokenUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            // Nếu lỗi thật sự khi parse/validate token => 401
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write(e.getMessage());
        }
    }

    private boolean isBypassToken(@NonNull HttpServletRequest request) {
        // Cho phép preflight
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;

        final List<Pair<String, String>> bypass = Arrays.asList(
                // ==== Auth/User public ====
                Pair.of(String.format("%s/user/register", apiPrefix), "POST"),
                Pair.of(String.format("%s/user/login", apiPrefix), "POST"),
                Pair.of(String.format("%s/user/refreshToken", apiPrefix), "POST"),
                Pair.of(String.format("%s/user/verify", apiPrefix), "POST"),
                Pair.of(String.format("%s/user/resend-verify", apiPrefix), "POST"),
                Pair.of(String.format("%s/user/reset-password", apiPrefix), "POST"),
                Pair.of(String.format("%s/user/reset", apiPrefix), "POST"),
                Pair.of(String.format("%s/user/resend-reset-password", apiPrefix), "POST"),
                Pair.of(String.format("%s/openai/chat", apiPrefix), "POST"),
                Pair.of(String.format("%s/user/auth/social-login", apiPrefix), "GET"),
                Pair.of(String.format("%s/user/auth/social/callback", apiPrefix), "GET"),

                // ==== Payment ====
                // Polling trạng thái
                Pair.of(String.format("%s/payment/.*/status", apiPrefix), "GET"),
                // Tạo QR (nếu muốn AUTH thì bỏ dòng này)
                Pair.of(String.format("%s/payment/qr", apiPrefix), "POST"),

                // VNPAY callbacks
                Pair.of(String.format("%s/payment/vnpay/return", apiPrefix), "GET"),
                Pair.of(String.format("%s/payment/vnpay/ipn", apiPrefix), "GET"),

                // (giữ) PayOS webhook cũ
                Pair.of(String.format("%s/payment/webhook", apiPrefix), "GET"),
                Pair.of(String.format("%s/payment/webhook", apiPrefix), "POST")
        );

        String requestPath = request.getServletPath();
        String method = request.getMethod();

        for (Pair<String, String> rule : bypass) {
            String pattern = rule.getFirst().replace("**", ".*");
            if (pattern.contains(".*")) {
                // đã có wildcard
            }
            // Hỗ trợ regex đơn giản cho "/.*/"
            if (requestPath.matches(pattern) && method.equalsIgnoreCase(rule.getSecond())) {
                return true;
            }
        }
        return false;
    }
}
