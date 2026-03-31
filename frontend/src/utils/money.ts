// Форматирует число или числовую строку в локализованную валюту.
export const formatMoney = (value: number | string, currency = 'RUB') => {
    // Приводит входное значение к числу перед форматированием.
    const amount = typeof value === 'string' ? Number(value) : value;

    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2
    }).format(Number.isFinite(amount) ? amount : 0);
};

// Преобразует значение в число и возвращает 0 для пустого ввода.
export const toNumber = (value: number | string) =>
    typeof value === 'number' ? value : Number.parseFloat(value || '0');
