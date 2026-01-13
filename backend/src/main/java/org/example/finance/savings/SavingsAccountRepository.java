package org.example.finance.savings;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SavingsAccountRepository
        extends JpaRepository<SavingsAccount, UUID> {

    List<SavingsAccount> findByUserId(UUID userId);
}

