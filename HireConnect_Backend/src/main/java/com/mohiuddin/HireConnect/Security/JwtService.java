package com.mohiuddin.HireConnect.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {

    @Value("${jwt.secret:}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;


    public SecretKey getSigningKey() {
        if (secretKey == null || secretKey.trim().isEmpty()) {
            throw new IllegalStateException("JWT secret key is not configured. Please set the JWT_SECRET environment variable.");
        }
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret key must be at least 32 bytes long for HMAC-SHA256. Current length: " + keyBytes.length);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        if (role != null) {
            claims.put("role", role);
        }
        return createToken(claims, email);
    }

    public String createToken(Map<String, Object> claims, String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(now))
                .expiration(new Date(now + jwtExpiration))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaims(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return extractClaims(token, claims -> claims.get("role", String.class));
    }

    public <T> T extractClaims(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        if (claims == null) {
            throw new IllegalArgumentException("Invalid token: unable to extract claims.");
        }
        return claimsResolver.apply(claims);
    }

    public Date extractExpiration(String token) {
        return extractClaims(token, Claims::getExpiration);
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Error extracting claims from token: {}", e.getMessage());
            return null;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration == null || expiration.before(new Date());
        } catch (Exception e) {
            log.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }

    public boolean validateToken(String token, String email) {
        try {
            final String extractedEmail = extractEmail(token);
            return (extractedEmail != null && extractedEmail.equalsIgnoreCase(email) && !isTokenExpired(token));
        } catch (Exception e) {
            log.error("Error validating token: {}", e.getMessage());
            return false;
        }
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims != null && claims.getExpiration() != null && !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            log.error("Invalid JWT Token: {}", e.getMessage());
            return false;
        }
    }
}
