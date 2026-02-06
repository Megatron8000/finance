package org.example.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DailyStats {

    private LocalDate date;
    private BigDecimal income;
    private BigDecimal expense;
}
