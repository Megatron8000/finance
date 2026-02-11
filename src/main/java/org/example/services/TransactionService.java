package org.example.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.dto.transaction.TransactionCreateRequest;
import org.example.entity.Account;
import org.example.entity.Category;
import org.example.entity.Transaction;
import org.example.entity.User;
import org.example.enums.TransactionType;
import org.example.repository.AccountRepository;
import org.example.repository.CategoryRepository;
import org.example.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Создание новой транзакции с изменением баланса.
     */
    @Transactional
    public UUID createTransaction(TransactionCreateRequest request, User user) {

        // Загружаем счёт
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));

        // Проверка принадлежности счёта пользователю
        if (!account.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        // Загружаем категорию
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        // Создаём транзакцию
        Transaction tx = new Transaction();
        tx.setId(UUID.randomUUID());
        tx.setUser(user);
        tx.setAccount(account);
        tx.setCategory(category);
        tx.setType(request.getType());
        tx.setAmount(request.getAmount());
        tx.setTransactionDate(request.getTransactionDate());
        tx.setDeleted(false);

        // Изменяем баланс
        if (tx.getType() == TransactionType.EXPENSE) {

            if (account.getBalance().compareTo(tx.getAmount()) < 0) {
                throw new IllegalStateException("Недостаточно средств");
            }

            account.setBalance(account.getBalance().subtract(tx.getAmount()));

        } else {
            account.setBalance(account.getBalance().add(tx.getAmount()));
        }

        accountRepository.save(account);
        transactionRepository.save(tx);

        return tx.getId();
    }

    /**
     * Логическое удаление транзакции с откатом баланса.
     */
    @Transactional
    public void deleteTransaction(UUID transactionId, User user) {

        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));

        if (tx.isDeleted()) {
            return;
        }

        // Проверка владельца
        if (!tx.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }

        Account account = tx.getAccount();

        if (tx.getType() == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().add(tx.getAmount()));
        } else {

            if (account.getBalance().compareTo(tx.getAmount()) < 0) {
                throw new IllegalStateException("Удаление приведёт к минусу");
            }

            account.setBalance(account.getBalance().subtract(tx.getAmount()));
        }

        tx.setDeleted(true);

        accountRepository.save(account);
        transactionRepository.save(tx);
    }
}