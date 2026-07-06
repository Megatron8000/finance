package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.account.AccountResponse;
import org.example.entity.Account;
import org.example.mapper.AccountMapper;
import org.example.entity.SavingsAccountDetails;
import org.example.enums.AccountType;
import org.example.exception.ValidationException;
import org.example.repository.AccountRepository;
import org.example.repository.SavingsAccountDetailsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final Clock clock;
    private final AccountMapper accountMapper;

    @Transactional
    public Account createAccount(UUID userId, String name, AccountType type) {
        if (name == null || name.isBlank()) {
            throw new ValidationException("account name must not be empty");
        }

        if (type == null) {
            throw new ValidationException("account type must not be null");
        }

        Account account = accountRepository.save(buildAccount(userId, name, type));

        if (type == AccountType.SAVINGS) {
            SavingsAccountDetails details = buildSavingsDetails(account);
            savingsRepository.save(details);
        }

        return account;
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts(UUID userId) {
        List<Account> accounts = accountRepository.findByUser_Id(userId);
        return accounts.stream().map(accountMapper::toResponse).toList();
    }

    private Account buildAccount(UUID userId, String name, AccountType type) {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setUserId(userId);
        account.setName(name);
        account.setType(type);
        account.setBalance(BigDecimal.ZERO);
        return account;
    }

    private SavingsAccountDetails buildSavingsDetails(Account account) {
        LocalDate today = LocalDate.now(clock);

        SavingsAccountDetails details = new SavingsAccountDetails();
        details.setAccount(account);
        details.setInterestRate(BigDecimal.ZERO);
        details.setStartDate(today);
        details.setLastCapitalizationDate(today);

        return details;
    }
}
