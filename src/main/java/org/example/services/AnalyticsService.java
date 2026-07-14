package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.analytics.BalanceResponse;
import org.example.dto.analytics.DailyStats;
import org.example.dto.analytics.PieChartItem;
import org.example.entity.Account;
import org.example.enums.Currency;
import org.example.enums.TransactionType;
import org.example.exception.ValidationException;
import org.example.repository.AccountRepository;
import org.example.repository.TransactionRepository;
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
@Transactional(readOnly = true)
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CurrencyService currencyService;
    private final Clock clock;

    public BigDecimal getTotalBalance(UUID userId) {
        Objects.requireNonNull(userId, "userId must not be null");

        List<Account> accounts = accountRepository.findByUser_Id(userId);
        LocalDate today = LocalDate.now(clock);

        BigDecimal totalInRub = BigDecimal.ZERO;
        for (Account account : accounts) {
            BigDecimal balance = account.getBalance();
            if (balance == null || balance.compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }
            if (account.getCurrency() == Currency.RUB) {
                totalInRub = totalInRub.add(balance);
            } else {
                BigDecimal rate = currencyService.getRateToRub(account.getCurrency(), today);
                totalInRub = totalInRub.add(balance.multiply(rate));
            }
        }

        return totalInRub;
    }

    public List<DailyStats> getDailyStats(UUID userId, LocalDate from, LocalDate to) {
        Objects.requireNonNull(userId, "userId must not be null");
        validatePeriod(from, to);

        return transactionRepository.getDailyStats(userId, from, to);
    }

    public List<PieChartItem> getPieChart(UUID userId, TransactionType type, LocalDate from, LocalDate to) {
        Objects.requireNonNull(userId, "userId must not be null");
        Objects.requireNonNull(type, "transaction type must not be null");

        validatePeriod(from, to);

        return transactionRepository.getPieChartData(userId, type, from, to);
    }

    private void validatePeriod(LocalDate from, LocalDate to) {
        Objects.requireNonNull(from, "from date must not be null");
        Objects.requireNonNull(to, "to date must not be null");

        if (from.isAfter(to)) {
            throw new ValidationException("from date must be before or equal to to date");
        }
    }
}
