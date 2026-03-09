package org.example.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Фильтр аутентификации JWT.
 *
 * <p>Фильтр выполняется для каждого HTTP-запроса один раз
 * (наследуется от {@link OncePerRequestFilter}).</p>
 *
 * <p>Основная задача фильтра:</p>
 * <ul>
 *     <li>Извлечь JWT токен из заголовка {@code Authorization}</li>
 *     <li>Проверить валидность токена</li>
 *     <li>Извлечь email пользователя из токена</li>
 *     <li>Найти пользователя в базе данных</li>
 *     <li>Создать объект аутентификации Spring Security</li>
 *     <li>Поместить его в {@link SecurityContextHolder}</li>
 * </ul>
 *
 * <p>После успешного выполнения фильтра пользователь считается
 * аутентифицированным в рамках текущего запроса.</p>
 *
 * <p>Ожидаемый формат заголовка:</p>
 *
 * <pre>
 * Authorization: Bearer &lt;jwt-token&gt;
 * </pre>
 *
 * <p>Если токен отсутствует или невалидный — запрос просто
 * передается дальше по цепочке фильтров без аутентификации.</p>
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    /**
     * Провайдер для работы с JWT:
     * проверка валидности токена и извлечение данных.
     */
    private final JwtProvider jwtProvider;

    /**
     * Репозиторий пользователей для загрузки пользователя из БД.
     */
    private final UserRepository userRepository;

    /**
     * Основной метод фильтра, который выполняется для каждого HTTP-запроса.
     *
     * <p>Алгоритм работы:</p>
     * <ol>
     *     <li>Получить заголовок Authorization</li>
     *     <li>Проверить, начинается ли он с "Bearer "</li>
     *     <li>Извлечь JWT токен</li>
     *     <li>Проверить валидность токена</li>
     *     <li>Извлечь email пользователя</li>
     *     <li>Загрузить пользователя из базы</li>
     *     <li>Создать объект Authentication</li>
     *     <li>Поместить его в SecurityContext</li>
     * </ol>
     *
     * @param request текущий HTTP-запрос
     * @param response текущий HTTP-ответ
     * @param filterChain цепочка фильтров Spring Security
     * @throws ServletException если произошла ошибка сервлета
     * @throws IOException если произошла ошибка ввода/вывода
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Получаем заголовок Authorization
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        // Если заголовок отсутствует или не начинается с Bearer — пропускаем запрос
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Извлекаем JWT токен (убираем "Bearer ")
        String token = authHeader.substring(7);

        // Проверяем валидность токена
        if (!jwtProvider.isValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Извлекаем email пользователя из токена
        String email = jwtProvider.extractEmail(token);

        // Загружаем пользователя из базы данных
        User user = userRepository.findByEmail(email).orElse(null);

        // Если пользователь не найден или уже есть аутентификация — пропускаем
        if (user == null || SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Создаем объект аутентификации Spring Security
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(user, null, java.util.List.of());

        // Добавляем детали запроса (IP, session id и т.п.)
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        // Устанавливаем аутентификацию в SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Передаем запрос дальше по цепочке фильтров
        filterChain.doFilter(request, response);
    }
}
