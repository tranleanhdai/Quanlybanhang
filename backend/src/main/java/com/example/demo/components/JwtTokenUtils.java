package com.example.demo.components;

import com.example.demo.entity.Token;
import com.example.demo.entity.User;
import com.example.demo.repositories.tokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
public class JwtTokenUtils {
    @Value("${jwt.expiration}")
    private int expiration; //save to an environment variable

    @Value("${jwt.expiration-refresh-token}")
    private int expirationRefreshToken;

    @Value("${jwt.secretKey}")
    private String secretKey;

    private final tokenRepository tokenRepository;

    public String generateToken(User user) throws Exception {
        // Properties => claims
        Map<String, Object> claims = new HashMap<>();
        // Add subject identifier (phone number or email)
        String subject = getSubject(user);
        claims.put("subject", subject);
        // Add user ID
        claims.put("userId", user.getId());

        try {
            // Generate the JWT token
            return Jwts.builder()
                    .setClaims(claims) // Set claims for the token
                    .setSubject(subject) // Set subject (optional if already in claims)
                    .setIssuedAt(new Date(System.currentTimeMillis())) // Set issue date
                    .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000L)) // Set expiration date
                    .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Sign token with secret key
                    .compact();
        } catch (Exception e) {
            throw new Exception("Cannot create JWT token, error: " + e.getMessage());
        }
    }

    private static String getSubject(User user) {
        // Trả về phoneNumber nếu không null hoặc không rỗng, ngược lại trả về email
        return (user.getEmail() != null && !user.getEmail().isBlank()) ? user.getEmail() : user.getPhone();
    }

    private SecretKey getSignInKey() {
        byte[] bytes = Decoders.BASE64.decode(secretKey);
        //Keys.hmacShaKeyFor(Decoders.BASE64.decode("TaqlmGv1iEDMRiFp/pHuID1+T84IABfuA0xXh4GhiUI="));
        return Keys.hmacShaKeyFor(bytes);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()  // Khởi tạo JwtParserBuilder
                .setSigningKey(getSignInKey())  // Thiết lập signing key
                .build()  // Xây dựng JwtParser
                .parseClaimsJws(token)  // Phân tích token đã ký (parse Signed JWT)
                .getBody();  // Lấy phần body của JWT, chứa claims
    }

    public  <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = this.extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public boolean isTokenExpired(String token) {
        Date expirationDate = this.extractClaim(token, Claims::getExpiration);
        return expirationDate.before(new Date());
    }

    public String getSubject(String token) {
        return  extractClaim(token, Claims::getSubject);
    }

    public Date getExpiration(String token) {
        return  extractClaim(token, Claims::getExpiration);
    }

    public Long getUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    public boolean validateToken(String token, User userDetails) {
            Long subjectId = getUserId(token);
            //subjectId là userId
            Token existingToken = tokenRepository.findByToken(token);
            if(existingToken == null ||
                    existingToken.isRevoked()||
                    !userDetails.isActive()
            ) {
                return false;
            }

            boolean tokenExpired = isTokenExpired(token);
            if (tokenExpired && !existingToken.isExpired()) {
                // Đánh dấu token expired trong DB
                existingToken.setExpired(true);
                tokenRepository.save(existingToken);
            }

            return (subjectId.equals(userDetails.getId())) && !isTokenExpired(token);
    }

}
