package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.analytics.DailyStats;
import org.example.dto.analytics.PieChartItem;
import org.example.enums.TransactionType;
import org.example.exception.ValidationException;
import org.example.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    public BigDecimal getTotalBalance(UUID userId) {
        Objects.requireNonNull(userId, "userId must not be null");

        BigDecimal total = transactionRepository.calculateTotalBalance(userId);
        return total != null ? total : BigDecimal.ZERO;
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
