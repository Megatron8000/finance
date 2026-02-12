package org.example.dto.auth;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO запроса на логин.
 * Используется в AuthController.
 */
public record LoginRequest(

        /**
         * Email пользователя (уникальный).
         */
        @Email(message = "Некорректный формат email")
        @NotBlank(message = "Email обязателен")
        @Size(max = 255, message = "Email слишком длинный")
        String email,

        /**
         * Пароль в открытом виде.
         * В БД никогда не сохраняется.
         */
        @NotBlank(message = "Пароль обязателен")
        @Size(min = 6, max = 100, message = "Пароль должен быть от 6 до 100 символов")
        String password

) {}
