package com.example.demo.repositories;

import com.example.demo.entity.Otp;
import com.example.demo.entity.OtpType;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface otpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByUserAndType(User user, OtpType type);
    void deleteByUserAndType(User user, OtpType type);
}
