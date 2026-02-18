package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.analytics.DailyStats;
import org.example.dto.analytics.PieChartItem;
import org.example.enums.TransactionType;
import org.example.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Сервис аналитики пользователя.
 * Содержит бизнес-логику для расчёта агрегированных данных.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    /**
     * Возвращает общий баланс пользователя по всем транзакциям.
     * Если транзакций нет — возвращается BigDecimal.ZERO.
     */
    public BigDecimal getTotalBalance(UUID userId) {
        Objects.requireNonNull(userId, "userId must not be null");

        BigDecimal total = transactionRepository.calculateTotalBalance(userId);

        // SUM в SQL возвращает null если нет строк
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Возвращает дневную статистику доходов и расходов за период.
     */
    public List<DailyStats> getDailyStats(
            UUID userId,
            LocalDate from,
            LocalDate to
    ) {
        Objects.requireNonNull(userId, "userId must not be null");
        validatePeriod(from, to);

        return transactionRepository.getDailyStats(
                userId,
                from,
                to
        );
    }

    /**
     * Возвращает данные для круговой диаграммы по категориям.
     */
    public List<PieChartItem> getPieChart(
            UUID userId,
            TransactionType type,
            LocalDate from,
            LocalDate to
    ) {
        Objects.requireNonNull(userId, "userId must not be null");
        Objects.requireNonNull(type, "transaction type must not be null");

        validatePeriod(from, to);

        return transactionRepository.getPieChartData(
                userId,
                type,
                from,
                to
        );
    }

    /**
     * Валидирует корректность периода.
     */
    private void validatePeriod(LocalDate from, LocalDate to) {
        Objects.requireNonNull(from, "from date must not be null");
        Objects.requireNonNull(to, "to date must not be null");

        if (from.isAfter(to)) {
            throw new IllegalArgumentException("from date must be before or equal to to date");
        }
    }
}