package org.example.repository;

import org.example.dto.analytics.DailyStats;
import org.example.dto.analytics.PieChartItem;
import org.example.entity.Transaction;
import org.example.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    /**
     * Суммарный баланс пользователя (доходы - расходы)
     */
    @Query("""
        select coalesce(
            sum(
                case
                    when t.type = 'INCOME' then t.amount
                    else -t.amount
                end
            ), 0)
        from Transaction t
        where t.user.id = :userId
          and t.deleted = false
    """)
    BigDecimal calculateTotalBalance(@Param("userId") UUID userId);

    /**
     * Доходы / расходы по дням
     */
    @Query("""
        select new org.example.dto.analytics.DailyStats(
            t.transactionDate,
            sum(case when t.type = 'INCOME' then t.amount else 0 end),
            sum(case when t.type = 'EXPENSE' then t.amount else 0 end)
        )
        from Transaction t
        where t.user.id = :userId
          and t.deleted = false
          and t.transactionDate between :from and :to
        group by t.transactionDate
        order by t.transactionDate
    """)
    List<DailyStats> getDailyStats(
            UUID userId,
            LocalDate from,
            LocalDate to
    );

    /**
     * Данные для круговой диаграммы
     */
    @Query("""
        select new org.example.dto.analytics.PieChartItem(
            c.name,
            sum(t.amount)
        )
        from Transaction t
        join t.category c
        where t.user.id = :userId
          and t.deleted = false
          and t.type = :type
          and t.transactionDate between :from and :to
        group by c.name
    """)
    List<PieChartItem> getPieChartData(
            UUID userId,
            TransactionType type,
            LocalDate from,
            LocalDate to
    );

    @Modifying
    @Query("""
        delete from Transaction t
        where t.account.id = :accountId
          and t.user.id = :userId
    """)
    void deleteByAccountIdAndUserId(
            @Param("accountId") UUID accountId,
            @Param("userId") UUID userId
    );

    @Query("""
        select t from Transaction t
        join fetch t.account
        join fetch t.category
        where t.user.id = :userId
          and t.deleted = false
          and t.transactionDate between :from and :to
        order by t.createdAt asc
    """)
    List<Transaction> findAllByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}
