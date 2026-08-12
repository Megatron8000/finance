package org.example.dto.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.enums.AccountType;
import org.example.enums.Currency;

public record AccountUpdateRequest(
        @NotBlank(message = "Account name is required")
        @Size(max = 100, message = "Account name must not exceed 100 characters")
        String name,

        @NotNull(message = "Account type is required")
        AccountType type,

        Currency currency
) {
    public AccountUpdateRequest {
        if (currency == null) {
            currency = Currency.RUB;
        }
    }
}
