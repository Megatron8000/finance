package org.example.finance.savings;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavingsAccountService {

    private final SavingsAccountRepository repo;

    public SavingsAccount create(
            UUID userId,
            BigDecimal amount,
            BigDecimal rate,
            int months
    ) {
        SavingsAccount sa = new SavingsAccount();
        sa.setUserId(userId);
        sa.setInitialAmount(amount);
        sa.setCurrentAmount(amount);
        sa.setInterestRate(rate);
        sa.setTermMonths(months);
        sa.setStartDate(LocalDate.now());
        sa.setEndDate(LocalDate.now().plusMonths(months));

        sa.setExpectedIncome(calculateIncome(sa));

        return repo.save(sa);
    }

    public SavingsAccount deposit(UUID id, BigDecimal depositAmount) {
        SavingsAccount sa = repo.findById(id).orElseThrow();

        sa.setCurrentAmount(sa.getCurrentAmount().add(depositAmount));
        sa.setExpectedIncome(calculateIncome(sa));

        return repo.save(sa);
    }

    private BigDecimal calculateIncome(SavingsAccount sa) {
        long remainingMonths =
                ChronoUnit.MONTHS.between(LocalDate.now(), sa.getEndDate());

        if (remainingMonths < 0) remainingMonths = 0;

        return sa.getCurrentAmount()
                .multiply(sa.getInterestRate())
                .multiply(BigDecimal.valueOf(remainingMonths))
                .divide(BigDecimal.valueOf(12 * 100), 2, RoundingMode.HALF_UP);
    }
}

