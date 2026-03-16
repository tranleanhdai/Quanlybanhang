// backend/src/main/java/com/example/demo/models/dtos/DashboardStatsDTO.java
package com.example.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    private long users;
    private long orders;
    private double revenue;
    private long products;
}
