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

    /**
     * Репозиторий для работы с транзакциями.
     * Используется ТОЛЬКО для доступа к данным, без бизнес-логики.
     */
    private final TransactionRepository transactionRepository;

    /**
     * Репозиторий для работы со счетами.
     */
    private final AccountRepository accountRepository;

    /**
     * Создание новой транзакции и изменение баланса счёта.
     *
     * Метод обёрнут в @Transactional, так как:
     * - изменяется баланс счёта
     * - сохраняется транзакция
     * Эти операции должны выполняться атомарно.
     *
     * @param tx транзакция для создания
     */
    @Transactional
    public void createTransaction(Transaction tx) {

        // Загружаем актуальное состояние счёта из БД
        // Нельзя доверять объекту, пришедшему с клиента
        Account account = accountRepository.findById(tx.getAccount().getId())
                .orElseThrow();

        // Если транзакция — расход
        if (tx.getType() == TransactionType.EXPENSE) {

            // Проверка запрета отрицательного баланса
            if (account.getBalance().compareTo(tx.getAmount()) < 0) {
                throw new IllegalStateException("Недостаточно средств");
            }
            // Уменьшаем баланс на сумму расхода
            account.setBalance(account.getBalance().subtract(tx.getAmount()));
        } else {
            // Если транзакция — доход, увеличиваем баланс
            account.setBalance(account.getBalance().add(tx.getAmount()));
        }
        // Сохраняем обновлённый баланс счёта
        accountRepository.save(account);
        // Сохраняем транзакцию
        transactionRepository.save(tx);
    }


    /**
     * Логическое удаление транзакции с откатом баланса.
     *
     * Физически транзакция не удаляется,
     * используется soft delete (флаг deleted).
     *
     * @param transactionId id транзакции
     */
    @Transactional
    public void deleteTransaction(UUID transactionId) {

        // Получаем транзакцию или выбрасываем ошибку, если не найдена
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new EntityNotFoundException("Transaction not found"));
        // Если транзакция уже удалена — ничего не делаем (идемпотентность)
        if (tx.isDeleted()) return;

        // Загружаем актуальное состояние счёта
        Account account = accountRepository.findById(tx.getAccount().getId())
                .orElseThrow();

        // Откат баланса в зависимости от типа транзакции
        if (tx.getType() == TransactionType.EXPENSE) {

            // Если удаляем расход — возвращаем деньги на счёт
            account.setBalance(account.getBalance().add(tx.getAmount()));
        } else {

            // Если удаляем доход — списываем деньги со счёта
            // Проверка, чтобы баланс не стал отрицательным
            if (account.getBalance().compareTo(tx.getAmount()) < 0) {
                throw new IllegalStateException("Удаление приведёт к минусу");
            }
            account.setBalance(account.getBalance().subtract(tx.getAmount()));
        }

        // Помечаем транзакцию как удалённую (soft delete)
        tx.setDeleted(true);

        // Сохраняем обновлённый баланс и транзакцию
        accountRepository.save(account);
        transactionRepository.save(tx);
    }
}

