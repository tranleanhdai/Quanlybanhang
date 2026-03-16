package com.example.demo.models.dtos;

import jakarta.persistence.Id;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmailDetailDTO {
    @Id
    private Long id;
    private String recipient;
    private String body;
    private String subject;
    private String attachment;

}