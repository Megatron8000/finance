package org.example.repository;

import org.example.entity.SavingsAccountDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SavingsAccountDetailsRepository
        extends JpaRepository<SavingsAccountDetails, UUID> {
}
