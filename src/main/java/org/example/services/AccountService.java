package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.account.AccountResponse;
import org.example.entity.Account;
import org.example.mapper.AccountMapper;
import org.example.entity.SavingsAccountDetails;
import org.example.enums.AccountType;
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

    @Transactional
    public Account updateAccount(UUID userId, UUID accountId, String name, AccountType type) {
        validateAccountData(name, type);

        Account account = accountRepository.findOwnedById(accountId, userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        AccountType previousType = account.getType();
        account.setName(name.trim());
        account.setType(type);

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

    private Account buildAccount(UUID userId, String name, AccountType type) {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setUserId(userId);
        account.setName(name.trim());
        account.setType(type);
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
            savingsRepository.save(buildSavingsDetails(account));
            return;
        }

        if (previousType == AccountType.SAVINGS) {
            savingsRepository.deleteForAccount(account.getId());
        }
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
