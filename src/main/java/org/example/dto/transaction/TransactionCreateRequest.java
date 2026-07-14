package org.example.dto.transaction;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.example.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class TransactionCreateRequest {

    @NotNull
    private UUID accountId;

    @NotNull
    private UUID categoryId;

    @NotNull
    private TransactionType type;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotNull
    private LocalDate transactionDate;

    @Size(max = 500)
    private String comment;

    /**
     * Сумма в рублях для конвертации.
     * Используется при пополнении валютного счёта.
     * Если указано, amount — итоговая сумма в валюте счёта (рассчитывается бэкендом).
     */
    private BigDecimal amountInRub;
}
