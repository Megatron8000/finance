package org.example.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.example.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Date;
import java.util.UUID;

/**
 * Провайдер JWT токенов.
 *
 * <p>Отвечает за:</p>
 * <ul>
 *     <li>Генерацию JWT access token</li>
 *     <li>Проверку валидности токена</li>
 *     <li>Извлечение данных пользователя из токена</li>
 * </ul>
 *
 * <p>Токен содержит:</p>
 * <ul>
 *     <li><b>subject</b> — email пользователя</li>
 *     <li><b>uid</b> — UUID пользователя</li>
 *     <li><b>iat</b> — время создания токена</li>
 *     <li><b>exp</b> — время истечения токена</li>
 * </ul>
 *
 * <p>Токен подписывается с использованием алгоритма HMAC и секретного ключа.</p>
 */
@Component
public class JwtProvider {

    /**
     * Источник времени.
     * Используется для корректного тестирования (можно подменить Clock).
     */
    private final Clock clock;

    /**
     * Секретный ключ для подписи JWT.
     * Загружается из конфигурации application.yml / application.properties.
     */
    private final String secret;

    /**
     * Время жизни токена в миллисекундах.
     */
    private final long validityMs;

    /**
     * Подготовленный ключ подписи JWT.
     */
    private SecretKey key;

    /**
     * Конструктор провайдера JWT.
     *
     * @param clock источник времени
     * @param secret секретный ключ подписи JWT
     * @param validityMs время жизни токена в миллисекундах
     */
    public JwtProvider(
            Clock clock,
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.validity-ms}") long validityMs
    ) {
        this.clock = clock;
        this.secret = secret;
        this.validityMs = validityMs;
    }

    /**
     * Инициализация ключа подписи JWT после создания bean.
     *
     * <p>Алгоритм:</p>
     * <ol>
     *     <li>Пробуем декодировать секрет как Base64</li>
     *     <li>Если не получилось — используем строку как обычный UTF-8 ключ</li>
     *     <li>Создаем HMAC ключ для подписи JWT</li>
     * </ol>
     */
    @PostConstruct
    void init() {
        byte[] keyBytes;

        try {
            // если секрет хранится в Base64
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (RuntimeException ex) {
            // если это обычная строка
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }

        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Генерирует JWT access token для пользователя.
     *
     * <p>В токен записываются:</p>
     * <ul>
     *     <li>Email пользователя (subject)</li>
     *     <li>UUID пользователя (claim uid)</li>
     *     <li>Время выпуска токена</li>
     *     <li>Время истечения токена</li>
     * </ul>
     *
     * @param user пользователь, для которого создается токен
     * @return подписанный JWT токен
     */
    public String generateToken(User user) {
        Date now = Date.from(clock.instant());
        Date expiry = new Date(now.getTime() + validityMs);

        return Jwts.builder()
                .subject(user.getEmail())                // основной идентификатор
                .claim("uid", user.getId().toString())   // UUID пользователя
                .issuedAt(now)                           // время создания
                .expiration(expiry)                      // время истечения
                .signWith(key)                           // подпись
                .compact();
    }

    /**
     * Проверяет валидность JWT токена.
     *
     * <p>Проверяется:</p>
     * <ul>
     *     <li>подпись токена</li>
     *     <li>структура токена</li>
     *     <li>срок действия</li>
     * </ul>
     *
     * @param token JWT токен
     * @return true если токен валиден, иначе false
     */
    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    /**
     * Извлекает email пользователя из JWT.
     *
     * <p>Email хранится в поле {@code subject}.</p>
     *
     * @param token JWT токен
     * @return email пользователя
     */
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Извлекает UUID пользователя из JWT.
     *
     * <p>UUID хранится в claim {@code uid}.</p>
     *
     * @param token JWT токен
     * @return UUID пользователя
     */
    public UUID extractUserId(String token) {
        String uid = parseClaims(token).get("uid", String.class);
        return UUID.fromString(uid);
    }

    /**
     * Парсит JWT токен и возвращает claims.
     *
     * <p>Метод выполняет:</p>
     * <ul>
     *     <li>проверку подписи токена</li>
     *     <li>проверку срока действия</li>
     *     <li>декодирование payload</li>
     * </ul>
     *
     * @param token JWT токен
     * @return claims токена
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
