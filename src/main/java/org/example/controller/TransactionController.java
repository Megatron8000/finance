package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.dto.transaction.TransactionCreateRequest;
import org.example.dto.transaction.TransactionResponse;
import org.example.dto.transaction.TransferRequest;
import org.example.entity.Transaction;
import org.example.entity.User;
import org.example.mapper.TransactionMapper;
import org.example.services.TransactionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
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
    private final TransactionMapper transactionMapper;

    /**
     * Получение списка транзакций за период
     */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal User user
    ) {
        List<Transaction> transactions = transactionService.listTransactions(user, from, to);
        List<TransactionResponse> response = transactions.stream()
                .map(transactionMapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

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

    /**
     * Перевод между счетами
     *
     * @param request DTO запроса перевода
     * @param user текущий авторизованный пользователь
     * @return UUID созданной транзакции
     */
    @PostMapping("/transfer")
    public ResponseEntity<UUID> transfer(
            @Valid @RequestBody TransferRequest request,
            @AuthenticationPrincipal User user
    ) {
        UUID transactionId = transactionService.transfer(request, user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(transactionId);
    }
}