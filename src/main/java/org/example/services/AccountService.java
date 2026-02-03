package org.example.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.entity.Account;
import org.example.entity.SavingsAccountDetails;
import org.example.entity.User;
import org.example.enums.AccountType;
import org.example.repository.AccountRepository;
import org.example.repository.SavingsAccountDetailsRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final SavingsAccountDetailsRepository savingsRepository;

    /**
     * Создание счёта
     */
    @Transactional
    public Account createAccount(User user, String name, AccountType type) {

        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setUser(user);
        account.setName(name);
        account.setType(type);
        account.setBalance(BigDecimal.ZERO);

        accountRepository.save(account);

        // Если накопительный — создаём детали
        if (type == AccountType.SAVINGS) {
            SavingsAccountDetails details = new SavingsAccountDetails();
            details.setAccount(account);
            details.setInterestRate(BigDecimal.ZERO);
            details.setStartDate(LocalDate.now());
            details.setLastCapitalizationDate(LocalDate.now());

            savingsRepository.save(details);
        }

        return account;
    }

    /**
     * Получение счетов пользователя
     */
    public List<Account> getAccounts(User user) {
        return accountRepository.findByUser(user);
    }
}

