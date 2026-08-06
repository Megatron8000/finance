package org.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
public class Transaction {

    @Id
    private UUID id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Account account;

    @ManyToOne
    private Category category;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private BigDecimal amount;

    private LocalDate transactionDate;

    @Column(name = "comment_text", length = 500)
    private String comment;

    @Column(name = "amount_in_rub", precision = 19, scale = 2)
    private BigDecimal amountInRub;

    @Column(name = "exchange_rate", precision = 19, scale = 6)
    private BigDecimal exchangeRate;

    private boolean deleted;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}

