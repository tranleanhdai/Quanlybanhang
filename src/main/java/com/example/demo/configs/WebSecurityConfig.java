package com.example.demo.configs;

import com.example.demo.filter.JwtTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity(debug = true)
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtTokenFilter jwtTokenFilter;
    private final AuthenticationProvider authenticationProvider;

    private final String apiPrefix = "/api";

    @Bean
    @Order(1)
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher(apiPrefix + "/**", "/ws/**","sign/**")
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .authenticationProvider(authenticationProvider)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public API endpoints
                        .requestMatchers(
                                String.format("%s/user/register", apiPrefix),
                                String.format("%s/user/login", apiPrefix),
                                String.format("%s/user/refreshToken", apiPrefix),
                                String.format("%s/user/verify", apiPrefix),
                                String.format("%s/user/resend-verify", apiPrefix),
                                String.format("%s/user/reset-password", apiPrefix),
                                String.format("%s/user/reset", apiPrefix),
                                String.format("%s/user/resend-reset-password", apiPrefix),
                                String.format("%s/openai/chat", apiPrefix),
                                String.format("%s/user/auth/social-login", apiPrefix),
                                String.format("%s/user/auth/social/callback", apiPrefix)
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"API Authentication required\", \"message\": \"" + authException.getMessage() + "\"}");
                        })
                )
                .csrf(AbstractHttpConfigurer::disable)
                .build();
    }
}
