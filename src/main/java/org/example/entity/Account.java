package org.example.entity;



import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.enums.AccountType;
import org.example.enums.Currency;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Getter
@Setter
public class Account {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;

    @Enumerated(EnumType.STRING)
    private AccountType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Currency currency = Currency.RUB;

    private BigDecimal balance;

    public void setUserId(UUID userId) {
        User user = new User();
        user.setId(userId);
        this.user = user;
    }
}