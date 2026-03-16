package com.example.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class userLoginDTO {
    @JsonProperty("email")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    @JsonProperty("role")
    private String role;


    public boolean isPasswordBlank() {
        return password == null || password.trim().isEmpty();
    }
}
