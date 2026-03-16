package com.example.demo.services.otp;

import com.example.demo.entity.OtpType;
import com.example.demo.entity.User;

public interface OtpService {
    void sendOtp(User user, String email, OtpType type);
    boolean verifyOtp(User user, String inputOtp, OtpType type);
    void resendOtp(User user, String email, OtpType type);
    public void saveOtp(User user, String otp, OtpType type);
    public String getOtp(User user, OtpType type);
    public void deleteOtp(User user, OtpType type);
}
