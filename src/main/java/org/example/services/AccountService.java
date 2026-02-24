package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.account.AccountResponse;
import org.example.entity.Account;
import org.example.entity.SavingsAccountDetails;
import org.example.enums.AccountType;
import org.example.repository.AccountRepository;
import org.example.repository.SavingsAccountDetailsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class AccountService {

    // Репозиторий для основной сущности Account
    private final AccountRepository accountRepository;

    // Репозиторий для деталей накопительного счета (Savings)
    private final SavingsAccountDetailsRepository savingsRepository;

    // Clock внедряется для корректной работы с датой (удобно тестировать)
    private final Clock clock;

    /**
     * Создание нового счета пользователя.
     *
     * @param userId id пользователя
     * @param name название счета
     * @param type тип счета (например, SAVINGS)
     * @return созданный Account
     */
    @Transactional
    public Account createAccount(UUID userId, String name, AccountType type) {

        // Валидация названия счета
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("account name must not be empty");
        }

        // Проверка типа счета на null
        Objects.requireNonNull(type, "account type must not be null");

        // Создаем основную сущность Account
        Account account = buildAccount(userId, name, type);

        // Сохраняем счет в БД
        accountRepository.save(account);

        // Если счет накопительный — создаем дополнительные детали
        if (type == AccountType.SAVINGS) {
            SavingsAccountDetails details = buildSavingsDetails(account);
            savingsRepository.save(details);
        }

        return account;
    }

    /**
     * Получение всех счетов пользователя.
     *
     * @param userId id пользователя
     * @return список счетов
     */
    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts(UUID userId) {

        List<Account> accounts = accountRepository.findByUserId(userId);

        return accounts.stream()
                .map(this::toResponse)
                .toList();
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getBalance()
        );
    }

    /**
     * Вспомогательный метод для создания базовой сущности Account.
     * Баланс по умолчанию = 0.
     */
    private Account buildAccount(UUID userId, String name, AccountType type) {
        Account account = new Account();
        account.setUserId(userId);              // владелец счета
        account.setName(name);                  // название счета
        account.setType(type);                  // тип счета
        account.setBalance(BigDecimal.ZERO);    // стартовый баланс всегда 0
        return account;
    }

    /**
     * Вспомогательный метод для создания деталей накопительного счета.
     * Устанавливает начальную процентную ставку и даты капитализации.
     */
    private SavingsAccountDetails buildSavingsDetails(Account account) {
        // Используем внедренный Clock (важно для тестируемости)
        LocalDate today = LocalDate.now(clock);

        SavingsAccountDetails details = new SavingsAccountDetails();
        details.setAccount(account);                    // связь с основным счетом
        details.setInterestRate(BigDecimal.ZERO);      // процент по умолчанию 0
        details.setStartDate(today);                   // дата открытия
        details.setLastCapitalizationDate(today);      // дата последней капитализации

        return details;
    }
}