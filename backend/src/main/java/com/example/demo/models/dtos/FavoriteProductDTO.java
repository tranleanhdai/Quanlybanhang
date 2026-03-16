package com.example.demo.models.dtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FavoriteProductDTO {

    private Long id;
    private String name;
    private Double price;
    private String imageURL;
}
