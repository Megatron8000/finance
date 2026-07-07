package org.example.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    private boolean deleted;
}

