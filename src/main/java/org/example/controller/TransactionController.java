package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.dto.transaction.TransactionCreateRequest;
import org.example.entity.User;
import org.example.services.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST-контроллер для работы с транзакциями
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    // Сервис бизнес-логики транзакций
    private final TransactionService transactionService;

    /**
     * Создание новой транзакции
     *
     * @param request DTO запроса
     * @param user текущий авторизованный пользователь
     * @return UUID созданной транзакции
     */
    @PostMapping
    public ResponseEntity<UUID> create(
            @Valid @RequestBody TransactionCreateRequest request,
            @AuthenticationPrincipal User user
    ) {

        UUID transactionId = transactionService.createTransaction(request, user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(transactionId);
    }

    /**
     * Логическое удаление транзакции
     *
     * @param id UUID транзакции
     * @param user текущий пользователь
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user
    ) {

        transactionService.deleteTransaction(id, user);

        return ResponseEntity.noContent().build();
    }
}