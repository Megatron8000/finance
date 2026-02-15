package org.example.dto.account;


import org.example.enums.AccountType;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO для отображения информации о счёте.
 */
public record AccountResponse(

        /**
         * ID счёта.
         */
        UUID id,

        /**
         * Название счёта.
         */
        String name,

        /**
         * Тип счёта.
         */
        AccountType type,

        /**
         * Текущий баланс.
         */
        BigDecimal balance

) {}
