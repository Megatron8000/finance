package org.example.dto.account;

import org.example.enums.AccountType;
import org.example.enums.Currency;

import java.math.BigDecimal;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String name,
        AccountType type,
        Currency currency,
        BigDecimal balance
) {}
