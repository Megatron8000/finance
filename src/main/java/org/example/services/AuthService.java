package org.example.services;

import lombok.RequiredArgsConstructor;
import org.example.dto.auth.AuthResponse;
import org.example.dto.auth.LoginRequest;
import org.example.dto.auth.RegisterRequest;
import org.example.entity.User;
import org.example.exception.ValidationException;
import org.example.repository.UserRepository;
import org.example.security.JwtProvider;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;
    private final JwtProvider jwtProvider;

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
            throw new ValidationException("Пользователь с таким email уже существует");
        }

        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        validateLoginRequest(request);

        String normalizedEmail = normalizeEmail(request.email());

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Неверный email или пароль"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Неверный email или пароль");
        }

        return buildAuthResponse(user);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request.email() == null || request.password() == null) {
            throw new ValidationException("Email и пароль обязательны");
        }
    }

    private void validateLoginRequest(LoginRequest request) {
        if (request.email() == null || request.password() == null) {
            throw new ValidationException("Email и пароль обязательны");
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtProvider.generateToken(user);
        return new AuthResponse(accessToken, "Bearer");
    }
}
