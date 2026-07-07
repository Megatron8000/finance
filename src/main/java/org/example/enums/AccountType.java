package org.example.enums;

public enum AccountType {
    CASH("Наличные"),
    NON_CASH("Безнал"),
    SAVINGS("Сбережения");

    private final String displayName;

    AccountType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}