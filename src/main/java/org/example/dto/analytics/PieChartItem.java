package org.example.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class PieChartItem {

    private String category;
    private BigDecimal amount;
}
