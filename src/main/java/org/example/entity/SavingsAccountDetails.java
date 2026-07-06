package org.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "savings_account_details")
@Getter
@Setter
public class SavingsAccountDetails {

    @Id
    private UUID accountId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "account_id")
    private Account account;

    private BigDecimal interestRate;

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDate lastCapitalizationDate;
}

