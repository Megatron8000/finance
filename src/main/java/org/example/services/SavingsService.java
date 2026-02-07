package org.example.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.entity.Account;
import org.example.entity.SavingsAccountDetails;
import org.example.repository.AccountRepository;
import org.example.repository.SavingsAccountDetailsRepository;
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

    /**
     * Количество дней в году, используется для расчёта годовой процентной ставки
     */
    private static final BigDecimal DAYS_IN_YEAR = BigDecimal.valueOf(365);

    /**
     * Масштаб округления для денежных операций (2 знака после запятой)
     */
    private static final int SCALE = 2;

    private final SavingsAccountDetailsRepository savingsRepository;
    private final AccountRepository accountRepository;

    /**
     * Clock используется вместо LocalDate.now()
     * для корректного тестирования и контроля времени
     */
    private final Clock clock;

    /**
     * Капитализация процентов по накопительному счёту.
     * Алгоритм:
     * 1. Загружаем данные накопительного счёта
     * 2. Проверяем, была ли уже капитализация сегодня
     * 3. Считаем количество дней с последней капитализации
     * 4. Рассчитываем начисленные проценты
     * 5. Обновляем баланс счёта и дату капитализации
     * @param accountId идентификатор банковского счёта
     */
    @Transactional
    public void capitalize(UUID accountId) {

        // Защита от передачи null — fail fast
        Objects.requireNonNull(accountId, "accountId must not be null");

        // Загружаем данные накопительного счёта.
        // Если запись не найдена — это бизнес-ошибка, а не NullPointerException
        SavingsAccountDetails details = savingsRepository.findById(accountId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Savings account details not found for accountId=" + accountId
                ));

        // Основной счёт, к которому привязаны накопительные условия
        Account account = details.getAccount();

        // Дата последней капитализации процентов
        LocalDate lastDate = details.getLastCapitalizationDate();

        // Текущая дата берётся через Clock, а не напрямую из системы
        LocalDate today = LocalDate.now(clock);

        // Если капитализация уже выполнялась сегодня или дата некорректна —
        // начислять проценты не нужно
        if (!lastDate.isBefore(today)) {
            return;
        }

        // Количество дней с последней капитализации
        long days = ChronoUnit.DAYS.between(lastDate, today);

        // Расчёт начисленных процентов:
        // balance * (rate / 100) * days / 365
        BigDecimal income = account.getBalance()
                .multiply(details.getInterestRate())              // баланс * процентная ставка
                .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP) // перевод процентов в долю
                .multiply(BigDecimal.valueOf(days))               // умножаем на количество дней
                .divide(DAYS_IN_YEAR, SCALE, RoundingMode.HALF_UP); // приводим к годовому значению

        // Увеличиваем баланс счёта на начисленные проценты
        account.setBalance(account.getBalance().add(income));

        // Фиксируем дату последней капитализации
        details.setLastCapitalizationDate(today);

        // Сохраняем изменения.
        // При отсутствии каскада сохраняем обе сущности явно
        accountRepository.save(account);
        savingsRepository.save(details);
    }
}
