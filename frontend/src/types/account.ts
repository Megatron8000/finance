// Тип счета: наличный, безналичный или накопительный.
export type AccountType = 'CASH' | 'NON_CASH' | 'SAVINGS';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    CASH: 'Наличные',
    NON_CASH: 'Безнал',
    SAVINGS: 'Сбережения',
};

export interface Account {
    // Уникальный идентификатор счета.
    id: string;
    // Отображаемое название счета.
    name: string;
    // Категория счета.
    type: AccountType;
    // Текущий баланс счета.
    balance: string;
}

export interface AccountCreatePayload {
    // Название создаваемого счета.
    name: string;
    // Тип создаваемого счета.
    type: AccountType;
}

export type AccountUpdatePayload = AccountCreatePayload;
