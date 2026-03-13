package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.entity.Account;
import org.example.entity.SavingsAccountDetails;
import org.example.exception.NotFoundException;
import org.example.exception.ValidationException;
import org.example.repository.AccountRepository;
import org.example.repository.SavingsAccountDetailsRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavingsService {

    private static final BigDecimal DAYS_IN_YEAR = BigDecimal.valueOf(365);
    private static final int SCALE = 2;

    private final SavingsAccountDetailsRepository savingsRepository;
    private final AccountRepository accountRepository;
    private final Clock clock;

    @Transactional
    public void capitalize(UUID accountId, UUID userId) {
        if (accountId == null) {
            throw new ValidationException("accountId must not be null");
        }
        if (userId == null) {
            throw new ValidationException("userId must not be null");
        }

        SavingsAccountDetails details = savingsRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("Savings account details not found for accountId=" + accountId));

        Account account = details.getAccount();
        if (!Objects.equals(account.getUser().getId(), userId)) {
            throw new AccessDeniedException("Account does not belong to current user");
        }

        LocalDate lastDate = details.getLastCapitalizationDate();
        LocalDate today = LocalDate.now(clock);

        if (!lastDate.isBefore(today)) {
            return;
        }

        long days = ChronoUnit.DAYS.between(lastDate, today);

        BigDecimal income = account.getBalance()
                .multiply(details.getInterestRate())
                .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(days))
                .divide(DAYS_IN_YEAR, SCALE, RoundingMode.HALF_UP);

        account.setBalance(account.getBalance().add(income));
        details.setLastCapitalizationDate(today);

        accountRepository.save(account);
        savingsRepository.save(details);
    }
}
