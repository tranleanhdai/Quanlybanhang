package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*; // <--- thêm import cho validation
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class User extends Base implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên không được để trống")
    @Size(max = 50, message = "Tên tối đa 50 ký tự")
    @Column(name = "name", length = 50)
    private String name;

    @Pattern(regexp = "^[0-9]{9,15}$", message = "Số điện thoại phải từ 9-15 chữ số")
    @Column(name = "phone", length = 15, unique = true)
    private String phone;

    @Email(message = "Email không hợp lệ")
    @Column(name = "email", length = 255, unique = true)
    private String email;

    @Size(max = 200, message = "Địa chỉ tối đa 200 ký tự")
    @Column(name = "address", length = 200)
    private String address;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6-100 ký tự")
    @Pattern(
            regexp = "^(?=.*[A-Za-z]).{6,100}$",
            message = "Mật khẩu phải chứa ít nhất một chữ cái"
    )
    @Column(name = "password", length = 100, nullable = false)
    private String password;


    @Column(name = "active")
    private boolean active = false;

    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    @Column(name = "birthday")
    private Date birthday;

    @Size(max = 255, message = "Link ảnh không quá 255 ký tự")
    @Column(name = "imageURL", length = 255)
    private String imageURL;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Vai trò không được để trống")
    @Column(name = "role", length = 20)
    private Role role;

    @Column(name = "google_account_id")
    private String googleAccountId;

    @JsonIgnore
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorityList = new ArrayList<>();
        authorityList.add(new SimpleGrantedAuthority("ROLE_" + role.name().toUpperCase()));
        return authorityList;
    }

    @Override
    public String getUsername() {
        return  email;
    }
}
