package org.example.repository;


import org.example.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    /**
     * Возвращает все счета пользователя по его идентификатору
     */
    List<Account> findByUser_Id(UUID userId);

    @Query("""
        select a
        from Account a
        where a.id = :accountId
          and a.user.id = :userId
    """)
    Optional<Account> findOwnedById(
            @Param("accountId") UUID accountId,
            @Param("userId") UUID userId
    );
}
