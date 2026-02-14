package org.example.dto.account;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.enums.AccountType;

/**
 * DTO для создания счёта.
 */
public record AccountCreateRequest(

        /**
         * Название счёта (например: "Карта Тинькофф").
         */
        @NotBlank(message = "Название счёта обязательно")
        @Size(max = 100, message = "Название не должно превышать 100 символов")
        String name,

        /**
         * Тип счёта:
         * CASH / NON_CASH / SAVINGS
         */
        @NotNull(message = "Тип счёта обязателен")
        AccountType type

) {}
