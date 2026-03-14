package org.example.mapper;

import org.example.dto.account.AccountResponse;
import org.example.entity.Account;
import org.springframework.stereotype.Component;

@Component
/**
 * Mapper для преобразования сущности {@link Account} в DTO ответа {@link AccountResponse}.
 */
public class AccountMapper {

    /**
     * Преобразует сущность счета в DTO для отдачи наружу.
     *
     * @param account сущность счета
     * @return DTO счета или {@code null}, если входной объект равен {@code null}
     */
    public AccountResponse toResponse(Account account) {
        if (account == null) {
            return null;
        }

        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getBalance()
        );
    }
}
