package org.example.services;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.entity.Account;
import org.example.entity.SavingsAccountDetails;
import org.example.entity.User;
import org.example.enums.AccountType;
import org.example.repository.AccountRepository;
import org.example.repository.SavingsAccountDetailsRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final SavingsAccountDetailsRepository savingsRepository;


    /**
     * Clock нужен для тестируемости.
     * В тестах можно подменить системное время.
     */
    private final Clock clock = Clock.systemDefaultZone();


    /**
     * Создание нового счёта пользователя
     *
     * @param user владелец счёта
     * @param name название счёта
     * @param type тип счёта (обычный / накопительный)
     * @return сохранённый Account
     */
    @Transactional
    public Account createAccount(User user, String name, AccountType type) {

        Account account = buildAccount(user, name, type);
        accountRepository.save(account);

        // Бизнес-правило: для накопительного счёта всегда создаются детали
        if (type == AccountType.SAVINGS) {
            SavingsAccountDetails details = buildSavingsDetails(account);
            savingsRepository.save(details);
        }

        return account;
    }

    /**
     * Получение всех счетов пользователя
     *
     * @param user владелец счетов
     * @return список счетов
     */
    @Transactional(readOnly = true)
    public List<Account> getAccounts(User user) {
        return accountRepository.findByUser(user);
    }

    /**
     * Фабричный метод создания Account.
     * Упрощает тестирование и чтение кода.
     */
    private Account buildAccount(User user, String name, AccountType type) {
        Account account = new Account();
        account.setUser(user);
        account.setName(name);
        account.setType(type);
        account.setBalance(BigDecimal.ZERO);
        return account;
    }

    /**
     * Фабричный метод создания SavingsAccountDetails.
     * Все дефолтные бизнес-значения сосредоточены в одном месте.
     */
    private SavingsAccountDetails buildSavingsDetails(Account account) {
        LocalDate today = LocalDate.now(clock);

        SavingsAccountDetails details = new SavingsAccountDetails();
        details.setAccount(account);
        details.setInterestRate(BigDecimal.ZERO); // дефолтное значение
        details.setStartDate(today);
        details.setLastCapitalizationDate(today);

        return details;
    }
}

