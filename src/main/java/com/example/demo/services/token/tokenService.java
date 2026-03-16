package com.example.demo.services.token;

import com.example.demo.entity.Token;
import com.example.demo.entity.User;

public interface tokenService {
    Token addToken(User user, String token);
    Token refreshToken(String refreshToken, User user) throws Exception;
}
