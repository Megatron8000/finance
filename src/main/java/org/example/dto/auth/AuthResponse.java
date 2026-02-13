package org.example.dto.auth;


/**
 * Ответ при успешной аутентификации.
 * Возвращает JWT access token.
 */
public record AuthResponse(
        String accessToken,
        String tokenType
) {
}
