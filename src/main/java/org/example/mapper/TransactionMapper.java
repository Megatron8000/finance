package org.example.mapper;

import org.example.dto.transaction.TransactionCreateRequest;
import org.example.dto.transaction.TransactionResponse;
import org.example.entity.Account;
import org.example.entity.Category;
import org.example.entity.Transaction;
import org.example.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class TransactionMapper {

    public Transaction toEntity(TransactionCreateRequest request, User user, Account account, Category category) {
        Transaction tx = new Transaction();
        tx.setId(UUID.randomUUID());
        tx.setUser(user);
        tx.setAccount(account);
        tx.setCategory(category);
        tx.setType(request.getType());
        tx.setAmount(request.getAmount());
        tx.setTransactionDate(request.getTransactionDate());
        tx.setComment(normalizeComment(request.getComment()));
        tx.setAmountInRub(request.getAmountInRub() != null ? request.getAmountInRub() : request.getAmount());
        tx.setExchangeRate(BigDecimal.ONE);
        tx.setDeleted(false);
        tx.setCreatedAt(LocalDateTime.now());
        return tx;
    }

    public TransactionResponse toResponse(Transaction tx) {
        if (tx == null) {
            return null;
        }

        return TransactionResponse.builder()
                .id(tx.getId())
                .accountId(tx.getAccount() != null ? tx.getAccount().getId() : null)
                .accountName(tx.getAccount() != null ? tx.getAccount().getName() : null)
                .accountCurrency(tx.getAccount() != null ? tx.getAccount().getCurrency() : null)
                .categoryId(tx.getCategory() != null ? tx.getCategory().getId() : null)
                .categoryName(tx.getCategory() != null ? tx.getCategory().getName() : null)
                .type(tx.getType())
                .amount(tx.getAmount())
                .amountInRub(tx.getAmountInRub())
                .exchangeRate(tx.getExchangeRate())
                .transactionDate(tx.getTransactionDate())
                .createdAt(tx.getCreatedAt())
                .comment(tx.getComment())
                .build();
    }

    private String normalizeComment(String comment) {
        if (comment == null || comment.isBlank()) {
            return null;
        }

        return comment.trim();
    }
}
