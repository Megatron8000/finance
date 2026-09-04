import type { Currency } from '../types/account';

export const formatMoney = (value: number | string, currency: Currency = 'RUB') => {
    const amount = typeof value === 'string' ? Number(value) : value;

    const isoMap: Record<Currency, string> = {
        RUB: 'RUB',
        BYN: 'BYN',
        USD: 'USD',
        CNY: 'CNY',
        AED: 'AED',
    };

    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: isoMap[currency] ?? 'RUB',
        maximumFractionDigits: 2
    }).format(Number.isFinite(amount) ? amount : 0);
};

export const toNumber = (value: number | string) =>
    typeof value === 'number' ? value : Number.parseFloat(value || '0');

export const formatCompactNumber = (value: number | string) => {
    const amount = typeof value === 'string' ? Number(value) : value;

    return new Intl.NumberFormat('ru-RU', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(Number.isFinite(amount) ? amount : 0);
};
