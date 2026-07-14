package org.example.dto.account;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.enums.AccountType;
import org.example.enums.Currency;

import java.math.BigDecimal;

public record AccountCreateRequest(
        @NotBlank(message = "Название счёта обязательно")
        @Size(max = 100, message = "Название не должно превышать 100 символов")
        String name,

        @NotNull(message = "Тип счёта обязателен")
        AccountType type,

        Currency currency,

        @DecimalMin(value = "0", message = "Процентная ставка не может быть отрицательной")
        @DecimalMax(value = "100", message = "Процентная ставка не может превышать 100%")
        BigDecimal interestRate
) {
    public AccountCreateRequest {
        if (currency == null) {
            currency = Currency.RUB;
        }
    }
}
