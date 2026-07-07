package org.example.mapper;

import org.example.dto.transaction.TransactionCreateRequest;
import org.example.dto.transaction.TransactionResponse;
import org.example.entity.Account;
import org.example.entity.Category;
import org.example.entity.Transaction;
import org.example.entity.User;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
/**
 * Маппер для преобразования DTO транзакций в сущности и обратно.
 */
public class TransactionMapper {

    /**
     * Создает сущность {@link Transaction} из данных запроса и связанных доменных объектов.
     *
     * @param request  входящий запрос на создание транзакции
     * @param user     владелец транзакции
     * @param account  счет, связанный с транзакцией
     * @param category категория, связанная с транзакцией
     * @return заполненная сущность {@link Transaction} со сгенерированным идентификатором
     */
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
        tx.setDeleted(false);
        return tx;
    }

    /**
     * Преобразует сущность {@link Transaction} в {@link TransactionResponse}.
     *
     * @param tx сущность транзакции
     * @return результат маппинга или {@code null}, если входное значение равно {@code null}
     */
    public TransactionResponse toResponse(Transaction tx) {
        if (tx == null) {
            return null;
        }

        return TransactionResponse.builder()
                .id(tx.getId())
                .accountId(tx.getAccount() != null ? tx.getAccount().getId() : null)
                .accountName(tx.getAccount() != null ? tx.getAccount().getName() : null)
                .categoryId(tx.getCategory() != null ? tx.getCategory().getId() : null)
                .categoryName(tx.getCategory() != null ? tx.getCategory().getName() : null)
                .type(tx.getType())
                .amount(tx.getAmount())
                .transactionDate(tx.getTransactionDate())
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
