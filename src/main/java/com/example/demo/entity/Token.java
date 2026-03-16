package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "token")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", length = 255)
    private String token;

    @Column(name = "refreshToken", length = 255)
    private String refreshToken;

    @Column(name = "tokenType", length = 50)
    private String tokenType;

    @Column(name = "expirationDate")
    private LocalDateTime expirationDate;

    @Column(name = "refreshExpirationDate")
    private LocalDateTime refreshExpirationDate;

    private boolean revoked;
    private boolean expired;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;

}
