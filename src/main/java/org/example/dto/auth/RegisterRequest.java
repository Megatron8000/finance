package org.example.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


/**
 * DTO запроса на регистрацию пользователя.
 */
public record RegisterRequest(

        /**
         * Email нового пользователя.
         */
        @Email(message = "Некорректный формат email")
        @NotBlank(message = "Email обязателен")
        @Size(max = 255, message = "Email слишком длинный")
        String email,

        /**
         * Пароль пользователя.
         * Минимум 8 символов.
         */
        @NotBlank(message = "Пароль обязателен")
        @Size(min = 8, max = 100, message = "Пароль должен не менее 8 символов")
        String password

) {}
