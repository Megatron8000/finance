export type AccountType = 'CASH' | 'NON_CASH' | 'SAVINGS';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    CASH: 'Наличные',
    NON_CASH: 'Безнал',
    SAVINGS: 'Сбережения',
};

export type Currency = 'RUB' | 'BYN' | 'USD' | 'CNY' | 'AED';

export const CURRENCY_META: Record<Currency, { label: string; flag: string; symbol: string; countryCode: string }> = {
    RUB: { label: 'Российский рубль', flag: '🇷🇺', symbol: '₽', countryCode: 'ru' },
    BYN: { label: 'Белорусский рубль', flag: '🇧🇾', symbol: 'Br', countryCode: 'by' },
    USD: { label: 'Американский доллар', flag: '🇺🇸', symbol: '$', countryCode: 'us' },
    CNY: { label: 'Китайский юань', flag: '🇨🇳', symbol: '¥', countryCode: 'cn' },
    AED: { label: 'Арабский дирхам', flag: '🇦🇪', symbol: 'د.إ', countryCode: 'ae' },
};

export const CURRENCY_OPTIONS: Currency[] = ['RUB', 'BYN', 'USD', 'CNY', 'AED'];

export interface Account {
    id: string;
    name: string;
    type: AccountType;
    currency: Currency;
    balance: string;
}

export interface AccountCreatePayload {
    name: string;
    type: AccountType;
    currency: Currency;
    interestRate?: number | null;
}

export type AccountUpdatePayload = AccountCreatePayload;
