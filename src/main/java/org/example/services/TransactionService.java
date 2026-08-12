package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.transaction.TransactionCreateRequest;
import org.example.dto.transaction.TransferRequest;
import org.example.entity.Account;
import org.example.entity.Category;
import org.example.entity.Transaction;
import org.example.entity.User;
import org.example.enums.Currency;
import org.example.enums.CategoryType;
import org.example.enums.TransactionType;
import org.example.mapper.TransactionMapper;
import org.example.exception.NotFoundException;
import org.example.exception.ValidationException;
import org.example.repository.AccountRepository;
import org.example.repository.CategoryRepository;
import org.example.repository.TransactionRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;
    private final CurrencyService currencyService;

    @Transactional
    public UUID createTransaction(TransactionCreateRequest request, User user) {
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new NotFoundException("Account not found"));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        Currency accountCurrency = account.getCurrency();
        LocalDate txDate = request.getTransactionDate();

        if (txDate == null) {
            txDate = LocalDate.now();
        }

        if (request.getType() == TransactionType.INCOME && accountCurrency != Currency.RUB
                && request.getAmountInRub() != null && request.getAmountInRub().compareTo(BigDecimal.ZERO) > 0) {

            BigDecimal rate = currencyService.getRateToRub(accountCurrency, txDate);
            BigDecimal convertedAmount = currencyService.convertToAccountCurrency(
                    request.getAmountInRub(), accountCurrency, txDate);

            request.setAmount(convertedAmount);
        }

        Transaction tx = transactionMapper.toEntity(request, user, account, category);

        BigDecimal rate = currencyService.getRateToRub(accountCurrency, txDate);
        tx.setExchangeRate(rate);

        if (request.getType() == TransactionType.INCOME) {
            if (request.getAmountInRub() != null && request.getAmountInRub().compareTo(BigDecimal.ZERO) > 0) {
                tx.setAmountInRub(request.getAmountInRub());
            } else {
                tx.setAmountInRub(currencyService.convertToRub(tx.getAmount(), accountCurrency, txDate));
            }
        } else {
            tx.setAmountInRub(currencyService.convertToRub(tx.getAmount(), accountCurrency, txDate));
        }

        if (tx.getType() == TransactionType.EXPENSE) {
            if (account.getBalance().compareTo(tx.getAmount()) < 0) {
                throw new ValidationException("Insufficient funds");
            }
            account.setBalance(account.getBalance().subtract(tx.getAmount()));
        } else {
            account.setBalance(account.getBalance().add(tx.getAmount()));
        }

        accountRepository.save(account);
        transactionRepository.save(tx);

        return tx.getId();
    }

    @Transactional
    public UUID transfer(TransferRequest request, User user) {
        Account fromAccount = accountRepository.findById(request.getFromAccountId())
                .orElseThrow(() -> new NotFoundException("Source account not found"));

        Account toAccount = accountRepository.findById(request.getToAccountId())
                .orElseThrow(() -> new NotFoundException("Destination account not found"));

        if (!fromAccount.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied to source account");
        }

        if (!toAccount.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied to destination account");
        }

        if (fromAccount.getId().equals(toAccount.getId())) {
            throw new ValidationException("Cannot transfer to the same account");
        }

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new ValidationException("Insufficient funds on source account");
        }

        LocalDate txDate = request.getTransactionDate();
        if (txDate == null) {
            txDate = LocalDate.now();
        }

        Category transferCategory = categoryRepository.findByName("Перевод между счетами")
                .orElseGet(() -> {
                    Category cat = new Category();
                    cat.setId(UUID.randomUUID());
                    cat.setName("Перевод между счетами");
                    cat.setType(CategoryType.EXPENSE);
                    cat.setSystem(true);
                    return categoryRepository.save(cat);
                });

        BigDecimal rate = currencyService.getRateToRub(fromAccount.getCurrency(), txDate);

        Transaction expenseTx = new Transaction();
        expenseTx.setId(UUID.randomUUID());
        expenseTx.setUser(user);
        expenseTx.setAccount(fromAccount);
        expenseTx.setCategory(transferCategory);
        expenseTx.setType(TransactionType.EXPENSE);
        expenseTx.setAmount(request.getAmount());
        expenseTx.setTransactionDate(txDate);
        expenseTx.setComment(request.getComment() != null ? request.getComment().trim() : null);
        expenseTx.setAmountInRub(currencyService.convertToRub(request.getAmount(), fromAccount.getCurrency(), txDate));
        expenseTx.setExchangeRate(rate);
        expenseTx.setDeleted(false);
        expenseTx.setCreatedAt(java.time.LocalDateTime.now());

        Transaction incomeTx = new Transaction();
        incomeTx.setId(UUID.randomUUID());
        incomeTx.setUser(user);
        incomeTx.setAccount(toAccount);
        incomeTx.setCategory(transferCategory);
        incomeTx.setType(TransactionType.INCOME);
        incomeTx.setTransactionDate(txDate);
        incomeTx.setComment(request.getComment() != null ? request.getComment().trim() : null);
        incomeTx.setDeleted(false);
        incomeTx.setCreatedAt(java.time.LocalDateTime.now());

        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));

        BigDecimal amountInRub = currencyService.convertToRub(request.getAmount(), fromAccount.getCurrency(), txDate);
        BigDecimal amountInTargetCurrency = currencyService.convertToAccountCurrency(amountInRub, toAccount.getCurrency(), txDate);

        incomeTx.setAmount(amountInTargetCurrency);
        incomeTx.setAmountInRub(amountInRub);
        incomeTx.setExchangeRate(currencyService.getRateToRub(toAccount.getCurrency(), txDate));

        toAccount.setBalance(toAccount.getBalance().add(amountInTargetCurrency));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);
        transactionRepository.save(expenseTx);
        transactionRepository.save(incomeTx);

        return expenseTx.getId();
    }

    public List<Transaction> listTransactions(User user, LocalDate from, LocalDate to) {
        return transactionRepository.findAllByUserIdAndDateRange(user.getId(), from, to);
    }

    @Transactional
    public void deleteTransaction(UUID transactionId, User user) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        if (tx.isDeleted()) {
            return;
        }

        if (!tx.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }

        Account account = tx.getAccount();

        if (tx.getType() == TransactionType.EXPENSE) {
            account.setBalance(account.getBalance().add(tx.getAmount()));
        } else {
            if (account.getBalance().compareTo(tx.getAmount()) < 0) {
                throw new ValidationException("Deleting transaction would make balance negative");
            }
            account.setBalance(account.getBalance().subtract(tx.getAmount()));
        }

        tx.setDeleted(true);

        accountRepository.save(account);
        transactionRepository.save(tx);
    }
}
