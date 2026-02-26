package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.auth.AuthResponse;
import org.example.dto.auth.LoginRequest;
import org.example.dto.auth.RegisterRequest;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Сервис аутентификации.
 * Содержит бизнес-логику регистрации и логина.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    /**
     * Регистрация нового пользователя.
     */
    public AuthResponse register(RegisterRequest request) {

        validateRegisterRequest(request);

        String normalizedEmail = normalizeEmail(request.email());

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setCreatedAt(LocalDateTime.now(clock));

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Пользователь с таким email уже существует");
        }

        return buildAuthResponse(user);
    }

    /**
     * Логин пользователя.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        validateLoginRequest(request);

        String normalizedEmail = normalizeEmail(request.email());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new BadCredentialsException("Неверный email или пароль"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Неверный email или пароль");
        }

        return buildAuthResponse(user);
    }

    /**
     * Нормализация email.
     */
    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    /**
     * Валидация регистрации.
     */
    private void validateRegisterRequest(RegisterRequest request) {
        if (request.email() == null || request.password() == null) {
            throw new IllegalArgumentException("Email и пароль обязательны");
        }
    }

    /**
     * Валидация логина.
     */
    private void validateLoginRequest(LoginRequest request) {
        if (request.email() == null || request.password() == null) {
            throw new IllegalArgumentException("Email и пароль обязательны");
        }
    }

    /**
     * Формирование ответа авторизации.
     * Здесь позже будет генерация JWT. Заменить на нормальный!!!
     */
    private AuthResponse buildAuthResponse(User user) {
        // Пока возвращается заглушка
        String fakeToken = user.getId().toString();

        return new AuthResponse(fakeToken, "fake");

    }
}
