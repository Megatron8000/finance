package org.example.finance.savings;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
public class SavingsAccount {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID userId;

    private BigDecimal initialAmount;
    private BigDecimal currentAmount;

    private BigDecimal interestRate; // % годовых
    private int termMonths;

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal expectedIncome;
}

