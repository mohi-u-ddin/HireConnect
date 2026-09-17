package com.mohiuddin.HireConnect.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:${Cors.allower-Origin:http://localhost:5173,http://localhost:3000}}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                String[] origins = (allowedOrigins != null && !allowedOrigins.isBlank())
                        ? Arrays.stream(allowedOrigins.split(","))
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .toArray(String[]::new)
                        : new String[]{"http://localhost:5173", "http://localhost:3000"};

                if (origins.length == 0) {
                    origins = new String[]{"http://localhost:5173", "http://localhost:3000"};
                }

                boolean hasWildcard = Arrays.stream(origins).anyMatch("*"::equals);

                if (hasWildcard) {
                    registry.addMapping("/**")
                            .allowedOriginPatterns("*")
                            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                            .allowedHeaders("*")
                            .exposedHeaders("Authorization", "Content-Disposition")
                            .allowCredentials(true)
                            .maxAge(3600);
                } else {
                    registry.addMapping("/**")
                            .allowedOrigins(origins)
                            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                            .allowedHeaders("*")
                            .exposedHeaders("Authorization", "Content-Disposition")
                            .allowCredentials(true)
                            .maxAge(3600);
                }
            }
        };
    }

}

