package org.example.dto.transaction;

import lombok.Getter;
import lombok.Setter;
import org.example.entity.Transaction;
import org.example.entity.User;
import org.example.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class TransactionCreateRequest {

    private UUID accountId;
    private UUID categoryId;
    private TransactionType type;
    private BigDecimal amount;
    private LocalDate transactionDate;

    public Transaction toEntity(User user) {
        Transaction tx = new Transaction();
        tx.setId(UUID.randomUUID());
        tx.setUser(user);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setTransactionDate(transactionDate);
        tx.setDeleted(false);
        return tx;
    }
}
