package org.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.time.Clock;

/**
 * JPA-конфигурация и инфраструктурные bean'ы слоя persistence.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {

    /**
     * Единый источник времени для сервисов (удобно тестировать через подмену bean).
     */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}