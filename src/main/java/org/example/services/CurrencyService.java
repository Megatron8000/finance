package org.example.services;

import lombok.extern.slf4j.Slf4j;
import org.example.enums.Currency;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class CurrencyService {

    private static final String CBR_URL =
            "https://www.cbr.ru/scripts/XML_daily.asp?date_req=%s";

    private final RestTemplate restTemplate = new RestTemplate();
    private final Clock clock;

    private final Map<String, BigDecimal> cache = new ConcurrentHashMap<>();

    public CurrencyService(Clock clock) {
        this.clock = clock;
    }

    public BigDecimal getRateToRub(Currency currency, LocalDate date) {
        if (currency == Currency.RUB) {
            return BigDecimal.ONE;
        }

        String key = currency.name() + "_" + date;
        BigDecimal cached = cache.get(key);
        if (cached != null) {
            return cached;
        }

        BigDecimal rate = fetchRateFromCbr(currency, date);
        cache.put(key, rate);
        return rate;
    }

    public BigDecimal convertToAccountCurrency(BigDecimal amountInRub, Currency targetCurrency, LocalDate date) {
        BigDecimal rate = getRateToRub(targetCurrency, date);
        return amountInRub.divide(rate, 2, RoundingMode.HALF_UP);
    }

    public BigDecimal convertToRub(BigDecimal amount, Currency sourceCurrency, LocalDate date) {
        BigDecimal rate = getRateToRub(sourceCurrency, date);
        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal fetchRateFromCbr(Currency currency, LocalDate date) {
        String formattedDate = date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String url = String.format(CBR_URL, formattedDate);

        try {
            String xml = restTemplate.getForObject(url, String.class);
            if (xml == null) {
                throw new RuntimeException("CBR returned empty response");
            }
            return parseRateFromXml(xml, currency);
        } catch (Exception e) {
            log.warn("Failed to fetch CBR rate for {} on {}: {}", currency, date, e.getMessage());
            return fallbackRate(currency);
        }
    }

    private BigDecimal parseRateFromXml(String xml, Currency currency) {
        String cbrCode = getCbrCharCode(currency);

        int currencyIndex = xml.indexOf("CharCode=\"" + cbrCode + "\"");
        if (currencyIndex == -1) {
            log.warn("Currency {} not found in CBR response, using fallback", cbrCode);
            return fallbackRate(currency);
        }

        int nominalStart = xml.indexOf("Nominal=\"", currencyIndex) + 9;
        int nominalEnd = xml.indexOf("\"", nominalStart);
        String nominal = xml.substring(nominalStart, nominalEnd);

        int valueStart = xml.indexOf("Value=\"", currencyIndex) + 7;
        int valueEnd = xml.indexOf("<", valueStart);
        String valueStr = xml.substring(valueStart, valueEnd).replace(",", ".").trim();

        BigDecimal value = new BigDecimal(valueStr);
        BigDecimal nominalNum = new BigDecimal(nominal);

        return value.divide(nominalNum, 6, RoundingMode.HALF_UP);
    }

    private String getCbrCharCode(Currency currency) {
        return switch (currency) {
            case USD -> "USD";
            case CNY -> "CNY";
            case BYN -> "BYN";
            case AED -> "AED";
            case RUB -> "RUB";
        };
    }

    private BigDecimal fallbackRate(Currency currency) {
        return switch (currency) {
            case USD -> new BigDecimal("90.00");
            case CNY -> new BigDecimal("12.50");
            case BYN -> new BigDecimal("28.00");
            case AED -> new BigDecimal("24.50");
            case RUB -> BigDecimal.ONE;
        };
    }
}
