// Проверка обязательного поля: возвращает правило и текст ошибки.
export const required = (label: string) => ({
    value: true,
    message: `Поле «${label}» обязательно`
});

// Проверка минимального значения: число должно быть не меньше заданного порога.
export const minValue = (value: number, label: string) => ({
    value,
    message: `Поле «${label}» должно быть не меньше ${value}`
});
