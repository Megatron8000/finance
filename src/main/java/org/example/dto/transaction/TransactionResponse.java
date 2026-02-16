package org.example.dto.transaction;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.example.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO для отображения транзакции.
 */
@Getter
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionResponse {

    /**
     * ID транзакции.
     */
    private UUID id;

    /**
     * ID счёта.
     */
    private UUID accountId;

    /**
     * Название счёта.
     */
    private String accountName;

    /**
     * ID категории.
     */
    private UUID categoryId;

    /**
     * Название категории.
     */
    private String categoryName;

    /**
     * Тип операции (INCOME / EXPENSE).
     */
    private TransactionType type;

    /**
     * Сумма операции.
     */
    private BigDecimal amount;

    /**
     * Дата операции.
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate transactionDate;
}
