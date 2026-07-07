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

/**
 * DTO для создания транзакции.
 */
@Getter
@Setter
public class TransactionCreateRequest {

    /**
     * ID счёта.
     */
    @NotNull
    private UUID accountId;

    /**
     * ID категории.
     */
    @NotNull
    private UUID categoryId;

    /**
     * Тип операции (INCOME / EXPENSE).
     */
    @NotNull
    private TransactionType type;

    /**
     * Сумма операции.
     */
    @NotNull
    @Positive
    private BigDecimal amount;

    /**
     * Дата операции.
     */
    @NotNull
    private LocalDate transactionDate;

    @Size(max = 500)
    private String comment;
}
