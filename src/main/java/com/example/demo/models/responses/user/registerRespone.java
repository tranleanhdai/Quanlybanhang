package com.example.demo.models.responses.user;

import com.example.demo.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class registerRespone {
    @JsonProperty("message")
    private String message;

    @JsonProperty("user")
    private User user;
}
