package com.example.demo.repositories;

import com.example.demo.entity.Token;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface tokenRepository extends JpaRepository<Token,Long> {
    Token findByToken(String token);
    List<Token> findByUser(User user);
    Token findByRefreshToken(String refreshToken);
}
