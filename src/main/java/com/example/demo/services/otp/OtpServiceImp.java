package com.example.demo.services.otp;

import com.example.demo.entity.Otp;
import com.example.demo.entity.User;
import com.example.demo.exceptions.AppException;
import com.example.demo.exceptions.ErrorCode;
import com.example.demo.models.dtos.EmailDetailDTO;
import com.example.demo.entity.OtpType;
import com.example.demo.repositories.otpRepository;
import com.example.demo.services.email.EmailService;
import com.example.demo.utils.otp.OtpGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class OtpServiceImp implements OtpService {
    private final EmailService emailSender;
    private final otpRepository otpRepository;

    @Override
    public void sendOtp(User user, String email, OtpType type) {
        String otp = OtpGenerator.generateOtp(6);

        this.saveOtp(user, otp, type);

        String subject = (type == OtpType.VERIFY)
                ? "Mã OTP xác nhận tài khoản"
                : "Mã OTP đặt lại mật khẩu";

        String body = "Vui lòng không chia sẻ mã xác nhận.\nMã OTP của bạn là: " + otp;

        EmailDetailDTO emailDetails = new EmailDetailDTO();
        emailDetails.setRecipient(email);
        emailDetails.setSubject(subject);
        emailDetails.setBody(body);

        emailSender.sendSimpleMail(emailDetails);
    }

    @Override
    public boolean verifyOtp(User user, String inputOtp, OtpType type) {
        String savedOtp = this.getOtp(user, type);
        if (savedOtp != null && savedOtp.equals(inputOtp)) {
            this.deleteOtp(user,type);
            return true;
        }
        return false;
    }

    @Override
    public void resendOtp(User user, String email, OtpType type) {
        this.deleteOtp(user, type);
        sendOtp(user, email, type);
    }

    @Override
    public void saveOtp(User user, String otp, OtpType type){
        Otp newOtp = Otp.builder()
                    .user(user)
                    .otp(otp)
                    .type(type)
                    .build();
        otpRepository.save(newOtp);
    }

    @Override
    public String getOtp(User user, OtpType type) {
        return otpRepository.findByUserAndType(user, type)
                .map(Otp::getOtp)
                .orElse(null);
    }

    @Override
    public void deleteOtp(User user, OtpType type) {
        otpRepository.deleteByUserAndType(user, type);
    }
}
