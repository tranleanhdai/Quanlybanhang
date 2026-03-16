package com.example.demo.models.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class userDTO {
    @NotBlank(message = "Tên không được để trống")
    @Size(max = 50, message = "Tên tối đa 50 ký tự")
    @JsonProperty("name")
    private String name;

    @Pattern(regexp = "^[0-9]{9,15}$", message = "Số điện thoại phải từ 9-15 chữ số")
    @JsonProperty("phone")
    private String phone;

    @Email(message = "Email không hợp lệ")
    @JsonProperty("email")
    private String email;

    @Size(max = 200, message = "Địa chỉ tối đa 200 ký tự")
    @JsonProperty("address")
    private String address;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6-100 ký tự")
    @Pattern(
            regexp = "^(?=.*[A-Za-z]).{6,100}$",
            message = "Mật khẩu phải chứa ít nhất một chữ cái"
    )
    @JsonProperty("password")
    private String password;

    @NotBlank(message = "Nhập lại mật khẩu không được để trống")
    @JsonProperty("retypePassword")
    private String retypePassword;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    @JsonProperty("birthday")
    private Date birthday;

    @Size(max = 255, message = "Link ảnh không quá 255 ký tự")
    @JsonProperty("imageURL") // giữ nguyên như Entity để tránh mismatch
    private String imageURL;

    @NotBlank(message = "Vai trò không được để trống")
    @JsonProperty("role")
    private String role;
}
