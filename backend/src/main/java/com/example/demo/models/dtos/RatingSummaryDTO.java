package com.example.demo.models.dtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RatingSummaryDTO {
    private double avg;
    private long count;
}
