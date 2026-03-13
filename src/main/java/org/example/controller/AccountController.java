package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.dto.account.AccountCreateRequest;
import org.example.dto.account.AccountResponse;
import org.example.entity.Account;
import org.example.entity.User;
import org.example.exception.ValidationException;
import org.example.services.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller для управления счетами пользователя
 */
@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * Создание нового счета
     */
    @PostMapping
    public ResponseEntity<AccountResponse> create(
            @Valid @RequestBody AccountCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        UUID userId = extractUserId(user);

        Account account = accountService.createAccount(
                userId,
                request.name(),
                request.type()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toResponse(account));
    }

    /**
     * Получение всех счетов текущего пользователя
     */
    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAll(
            @AuthenticationPrincipal User user
    ) {
        UUID userId = extractUserId(user);

        List<AccountResponse> response = accountService.getAccounts(userId);

        return ResponseEntity.ok(response);
    }

    /**
     * Безопасное извлечение id пользователя из security context
     */
    private UUID extractUserId(User user) {
        if (user == null) {
            throw new ValidationException("Authenticated user not found");
        }
        return user.getId();
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getType(),
                account.getBalance()
        );
    }
}