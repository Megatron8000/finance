package org.example.transaction;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.common.TransactionType;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue
    private UUID id;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private UUID categoryId;
    private UUID accountId;
    private UUID userId;

    private LocalDateTime date;
}

