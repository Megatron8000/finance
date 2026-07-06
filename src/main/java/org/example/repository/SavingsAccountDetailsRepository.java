package org.example.repository;

import org.example.entity.SavingsAccountDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface SavingsAccountDetailsRepository
        extends JpaRepository<SavingsAccountDetails, UUID> {

    @Modifying
    @Query("""
        delete from SavingsAccountDetails details
        where details.account.id = :accountId
    """)
    void deleteForAccount(@Param("accountId") UUID accountId);
}
