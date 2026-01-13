package src.main.java.org.example.finance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Главный класс backend-приложения сервиса учета финансов.
 *
 * Функциональные возможности:
 * - регистрация и авторизация пользователей (JWT)
 * - учет доходов и расходов
 * - поддержка счетов (наличные / безналичные)
 * - категории доходов и расходов (дефолтные и пользовательские)
 * - накопительные счета с автоматическим расчетом доходности
 *
 * Технологический стек:
 * - Java 24
 * - Spring Boot
 * - Spring Security
 * - Spring Data JPA
 * - PostgreSQL
 * - Gradle
 */
@SpringBootApplication
@EntityScan(basePackages = "com.example.finance")
@EnableJpaRepositories(basePackages = "com.example.finance")
public class FinanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceApplication.class, args);
    }
}
