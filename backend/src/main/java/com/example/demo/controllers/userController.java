package com.example.demo.controllers;

import com.example.demo.components.GetUserLogged;
import com.example.demo.entity.OtpType;
import com.example.demo.entity.Token;
import com.example.demo.entity.User;
import com.example.demo.models.dtos.OtpDTO;
import com.example.demo.models.dtos.userDTO;
import com.example.demo.models.dtos.userLoginDTO;
import com.example.demo.models.responses.ApiResponse;
import com.example.demo.models.responses.user.loginRespone;
import com.example.demo.models.responses.user.registerRespone;
import com.example.demo.repositories.userRepository;
import com.example.demo.services.otp.OtpService;
import com.example.demo.services.token.tokenService;
import com.example.demo.services.user.userService;
import com.example.demo.successnotify.SuccessNotify;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class userController {
    private final userService userService;
    private final tokenService tokenService;
    private final OtpService otpService;
    private final GetUserLogged getUserLogged;

    @PostMapping("/register")
    public ApiResponse<?> register(@Valid @RequestBody userDTO dto, BindingResult result) {

        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();

            return ApiResponse.<String>builder()
                    .httpStatus(HttpStatus.BAD_REQUEST)
                    .message(String.join(";", errorMessages))
                    .build();
        }

        User savedUser = userService.createUser(dto);
        otpService.sendOtp(savedUser, savedUser.getEmail(), OtpType.VERIFY);
        registerRespone responseData = registerRespone.builder()
                    .message("Đăng ký thành công")
                    .user(savedUser)
                    .build();

        return  ApiResponse.<registerRespone>builder()
                .message("Success")
                .httpStatus(HttpStatus.OK)
                .data(responseData)
                .build();

    }
    @PostMapping("/login")
    public ApiResponse<loginRespone> login(
            @Valid @RequestBody userLoginDTO userLoginDTO,
            HttpServletRequest request
    ) throws  Exception {
        // Kiểm tra thông tin đăng nhập và sinh token
        String token = userService.login(userLoginDTO);

        String userAgent = request.getHeader("User-Agent");
        User userDetail = userService.getUserDetailsFromToken(token);
        Token jwtToken = tokenService.addToken(userDetail, token);

        // Trả về token trong response
        return ApiResponse.<loginRespone>builder()
                .message(SuccessNotify.LOGIN_SUCCESS)
                .data(loginRespone.builder().token(jwtToken.getToken())
                        .tokenType(jwtToken.getTokenType())
                        .refreshToken(jwtToken.getRefreshToken())
                        .username(userDetail.getUsername())
                        .role(String.valueOf(userDetail.getRole()))
                        .id(userDetail.getId())
                        .message(SuccessNotify.LOGIN_SUCCESS)
                        .build()).httpStatus(HttpStatus.CREATED).build();
    }

    @PostMapping("/verify")
    
    public ApiResponse<?> verifyOtp(@Valid @RequestBody OtpDTO dto) throws  Exception{
        User user = this.userService.getUserByEmail(dto.getEmail());
        boolean valid = otpService.verifyOtp(user, dto.getInputOtp(), OtpType.VERIFY);
        if (valid)
        {
            this.userService.changeStatusTrueUser(user);
            return ApiResponse.<Boolean>builder()
                    .message(SuccessNotify.CONFIRMED_SUCCESS)
                    .data(true)
                    .httpStatus(HttpStatus.OK)
                    .build();
        }
        return ApiResponse.<Boolean>builder()
                .message(SuccessNotify.CONFIRMED_NO_SUCCESS)
                .data(false)
                .httpStatus(HttpStatus.OK)
                .build();
    }

    @PostMapping("/resend-verify")
    
    public ApiResponse<?> resendStatusOtp(@Valid @RequestBody OtpDTO dto) throws  Exception{
        User user = this.userService.getUserByEmail(dto.getEmail());

        otpService.resendOtp(user,dto.getEmail(), OtpType.VERIFY);

        return ApiResponse.<String>builder()
                .message(SuccessNotify.RESEND_VERIFY_SUCCESS)
                .data("OTP " + OtpType.VERIFY + " mới đã được gửi lại!")
                .httpStatus(HttpStatus.OK)
                .build();
    }

    @PatchMapping(path = "/change-avatar",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER')")
    public ApiResponse<?> uploadProfileImageCurrentUser(@RequestParam("profileImage") MultipartFile profileImage) throws  Exception{
        User user = getUserLogged.getLoggedInUser();
        userService.changeProfileImage(user,profileImage);
        String imageName = user.getImageURL();
        return ApiResponse.<String>builder()
                .message(SuccessNotify.UPDATE_PROFILE_SUCCESS)
                .httpStatus(HttpStatus.OK)
                .data(imageName)
                .build();
    }
    // Gửi OTP reset password
                @PostMapping("/reset-password")
                public ApiResponse<?> requestResetPassword(@RequestBody OtpDTO dto) throws Exception {
                User user = this.userService.getUserByEmail(dto.getEmail());
                otpService.sendOtp(user, user.getEmail(), OtpType.RESET);
                return ApiResponse.<String>builder()
                        .message("Đã gửi OTP đặt lại mật khẩu")
                        .data("OK")
                        .httpStatus(HttpStatus.OK)
                        .build();
                }

                // Gửi lại OTP reset
                @PostMapping("/resend-reset-password")
                public ApiResponse<?> resendResetPassword(@RequestBody OtpDTO dto) throws Exception {
                User user = this.userService.getUserByEmail(dto.getEmail());
                otpService.resendOtp(user, user.getEmail(), OtpType.RESET);
                return ApiResponse.<String>builder()
                        .message("Đã gửi lại OTP đặt lại mật khẩu")
                        .data("OK")
                        .httpStatus(HttpStatus.OK)
                        .build();
                }

                // Xác nhận OTP & đổi mật khẩu
                @PostMapping("/reset")
                public ApiResponse<?> resetPassword(@RequestBody com.example.demo.models.dtos.ResetPasswordDTO dto) throws Exception {
                User user = this.userService.getUserByEmail(dto.getEmail());

                boolean ok = otpService.verifyOtp(user, dto.getInputOtp(), OtpType.RESET);
                if (!ok) {
                        return ApiResponse.<Boolean>builder()
                                .message("OTP không đúng hoặc đã hết hiệu lực")
                                .data(false)
                                .httpStatus(HttpStatus.OK)
                                .build();
                }

                // đổi mật khẩu
                this.userService.changePassword(user, dto.getNewPassword(), dto.getRetypePassword());
                return ApiResponse.<Boolean>builder()
                        .message("Đổi mật khẩu thành công")
                        .data(true)
                        .httpStatus(HttpStatus.OK)
                        .build();
}

}
