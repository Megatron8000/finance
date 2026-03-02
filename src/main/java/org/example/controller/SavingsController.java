package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.entity.User;
import org.example.services.SavingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Контроллер для операций по накопительным счетам.
 */
@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
public class SavingsController {

    private final SavingsService savingsService;

    /**
     * Выполняет капитализацию процентов по накопительному счету.
     *
     * @param accountId ID счета
     * @param user текущий авторизованный пользователь
     * @return 204 No Content если операция успешна
     */
    @PostMapping("/{accountId}/capitalize")
    public ResponseEntity<Void> capitalize(
            @PathVariable UUID accountId,
            @AuthenticationPrincipal User user
    ) {
        savingsService.capitalize(accountId, user.getId());
        return ResponseEntity.noContent().build();
    }
}