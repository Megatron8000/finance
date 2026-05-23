package org.example.repository;


import org.example.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    /**
     * Возвращает все счета пользователя по его идентификатору
     */
    List<Account> findByUser_Id(UUID userId);
}
