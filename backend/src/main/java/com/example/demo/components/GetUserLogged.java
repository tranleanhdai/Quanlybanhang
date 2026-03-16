package com.example.demo.components;

import com.example.demo.entity.User;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.repositories.userRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class GetUserLogged {
    private final userRepository userRepository;

    public Optional<User> getUserOptional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return Optional.empty();

        String username;
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails ud) {
            username = ud.getUsername();
        } else {
            username = auth.getName();
        }
        if (username == null || username.isBlank()) return Optional.empty();

        // Hệ thống login bằng email
        return userRepository.findByEmail(username);
    }

    public User getUser() {
        return getUserOptional().orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }

    // ✅ Alias cho tương thích với userController cũ
    public User getLoggedInUser() {
        return getUser();
    }
}
