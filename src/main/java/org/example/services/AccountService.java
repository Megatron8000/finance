package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.account.AccountResponse;
import org.example.entity.Account;
import org.example.mapper.AccountMapper;
import org.example.entity.SavingsAccountDetails;
import org.example.enums.AccountType;
import org.example.enums.Currency;
import org.example.exception.NotFoundException;
import org.example.exception.ValidationException;
import org.example.repository.AccountRepository;
import org.example.repository.SavingsAccountDetailsRepository;
import org.example.repository.TransactionRepository;
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
    private final TransactionRepository transactionRepository;
    private final Clock clock;
    private final AccountMapper accountMapper;

    @Transactional
    public Account createAccount(UUID userId, String name, AccountType type, Currency currency, BigDecimal interestRate) {
        if (name == null || name.isBlank()) {
            throw new ValidationException("account name must not be empty");
        }

        if (type == null) {
            throw new ValidationException("account type must not be null");
        }

        if (currency == null) {
            currency = Currency.RUB;
        }

        Account account = accountRepository.save(buildAccount(userId, name, type, currency));

        if (type == AccountType.SAVINGS) {
            SavingsAccountDetails details = buildSavingsDetails(account, interestRate);
            savingsRepository.save(details);
        }

        return account;
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts(UUID userId) {
        List<Account> accounts = accountRepository.findByUser_Id(userId);
        return accounts.stream().map(accountMapper::toResponse).toList();
    }

    @Transactional
    public Account updateAccount(UUID userId, UUID accountId, String name, AccountType type, Currency currency) {
        validateAccountData(name, type);

        Account account = accountRepository.findOwnedById(accountId, userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        AccountType previousType = account.getType();
        account.setName(name.trim());
        account.setType(type);

        if (currency != null) {
            account.setCurrency(currency);
        }

        syncSavingsDetails(account, previousType, type);

        return accountRepository.save(account);
    }

    @Transactional
    public void deleteAccount(UUID userId, UUID accountId) {
        Account account = accountRepository.findOwnedById(accountId, userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        savingsRepository.deleteForAccount(account.getId());
        transactionRepository.deleteByAccountIdAndUserId(account.getId(), userId);
        accountRepository.delete(account);
    }

    private Account buildAccount(UUID userId, String name, AccountType type, Currency currency) {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setUserId(userId);
        account.setName(name.trim());
        account.setType(type);
        account.setCurrency(currency);
        account.setBalance(BigDecimal.ZERO);
        return account;
    }

    private void validateAccountData(String name, AccountType type) {
        if (name == null || name.isBlank()) {
            throw new ValidationException("account name must not be empty");
        }

        if (type == null) {
            throw new ValidationException("account type must not be null");
        }
    }

    private void syncSavingsDetails(Account account, AccountType previousType, AccountType newType) {
        if (previousType == newType) {
            return;
        }

        if (newType == AccountType.SAVINGS) {
            savingsRepository.save(buildSavingsDetails(account, BigDecimal.ZERO));
            return;
        }

        if (previousType == AccountType.SAVINGS) {
            savingsRepository.deleteForAccount(account.getId());
        }
    }

    private SavingsAccountDetails buildSavingsDetails(Account account, BigDecimal interestRate) {
        LocalDate today = LocalDate.now(clock);

        SavingsAccountDetails details = new SavingsAccountDetails();
        details.setAccount(account);
        details.setInterestRate(interestRate != null ? interestRate : BigDecimal.ZERO);
        details.setStartDate(today);
        details.setLastCapitalizationDate(today);

        return details;
    }
}
