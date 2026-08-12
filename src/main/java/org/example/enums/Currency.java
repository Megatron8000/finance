package org.example.enums;

import java.math.BigDecimal;
import java.util.Locale;

public enum Currency {
    RUB("Российский рубль", "₽", "RUB", BigDecimal.ONE),
    BYN("Белорусский рубль", "Br", "BYN", null),
    USD("Американский доллар", "$", "USD", null),
    CNY("Китайский юань", "¥", "CNY", null),
    AED("Арабский дирхам", "د.إ", "AED", null);

    private final String displayName;
    private final String symbol;
    private final String isoCode;
    private final BigDecimal fixedRateToRub;

    Currency(String displayName, String symbol, String isoCode, BigDecimal fixedRateToRub) {
        this.displayName = displayName;
        this.symbol = symbol;
        this.isoCode = isoCode;
        this.fixedRateToRub = fixedRateToRub;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getIsoCode() {
        return isoCode;
    }

    public BigDecimal getFixedRateToRub() {
        return fixedRateToRub;
    }

    public Locale getLocale() {
        return switch (this) {
            case RUB -> new Locale("ru", "RU");
            case BYN -> new Locale("be", "BY");
            case USD -> Locale.US;
            case CNY -> Locale.CHINA;
            case AED -> new Locale("ar", "AE");
        };
    }
}
