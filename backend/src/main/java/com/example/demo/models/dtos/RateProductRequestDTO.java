package com.example.demo.models.dtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RateProductRequestDTO {
    // số sao user chọn, 1–5
    private int rating;
}
