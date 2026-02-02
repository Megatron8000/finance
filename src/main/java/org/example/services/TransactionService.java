package org.example.services;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.entity.Account;
import org.example.entity.Transaction;
import org.example.enums.TransactionType;
import org.example.repository.AccountRepository;
import org.example.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public void createTransaction(Transaction tx) {

        Account account = accountRepository.findById(tx.getAccount().getId())
                .orElseThrow();

        // Проверка запрета отрицательного баланса
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
    }

    @Transactional
    public void deleteTransaction(UUID transactionId) {

        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));

        if (tx.isDeleted()) return;

        Account account = accountRepository.findById(tx.getAccount().getId())
                .orElseThrow();

        // Откат баланса
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

