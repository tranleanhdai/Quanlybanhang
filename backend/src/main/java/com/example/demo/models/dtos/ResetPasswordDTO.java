package com.example.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordDTO {
    @JsonProperty("email")
    private String email;

    // KHỚP với FE: input_otp
    @JsonProperty("input_otp")
    private String inputOtp;

    private String newPassword;
    private String retypePassword;
}
