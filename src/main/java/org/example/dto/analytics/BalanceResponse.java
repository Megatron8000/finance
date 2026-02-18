package org.example.dto.analytics;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

/**
 * DTO для отображения общего баланса пользователя.
 */
@Getter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BalanceResponse {

    /**
     * Общий баланс по всем счетам.
     * Никогда не должен быть null.
     */
    private BigDecimal totalBalance;
}