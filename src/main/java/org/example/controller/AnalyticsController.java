package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.analytics.BalanceResponse;
import org.example.dto.analytics.DailyStats;
import org.example.dto.analytics.PieChartItem;
import org.example.enums.TransactionType;
import org.example.exception.ValidationException;
import org.example.services.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/balance")
    public BalanceResponse getBalance(@AuthenticationPrincipal(expression = "id") UUID userId) {
        return BalanceResponse.builder()
                .totalBalance(analyticsService.getTotalBalance(userId))
                .build();
    }

    @GetMapping("/daily")
    public List<DailyStats> getDailyStats(
            @AuthenticationPrincipal(expression = "id") UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        if (from.isAfter(to)) {
            throw new ValidationException("From date must be before to date");
        }

        return analyticsService.getDailyStats(userId, from, to);
    }

    @GetMapping("/pie")
    public List<PieChartItem> getPieChart(
            @AuthenticationPrincipal(expression = "id") UUID userId,
            @RequestParam TransactionType type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        if (from.isAfter(to)) {
            throw new ValidationException("From date must be before to date");
        }

        return analyticsService.getPieChart(userId, type, from, to);
    }
}
