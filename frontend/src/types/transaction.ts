import type { CategoryType } from './category';

// Тип транзакции наследуется от типа категории (доход/расход).
export type TransactionType = CategoryType;

// Модель транзакции, используемая для отображения и хранения данных.
export interface Transaction {
    // Уникальный идентификатор транзакции.
    id: string;
    // Идентификатор счёта, к которому относится транзакция.
    accountId: string;
    // Название счёта (опционально, для отображения).
    accountName?: string;
    // Идентификатор категории транзакции.
    categoryId: string;
    // Название категории (опционально, для отображения).
    categoryName?: string;
    // Тип транзакции (доход/расход).
    type: TransactionType;
    // Сумма транзакции в строковом формате.
    amount: string;
    // Дата транзакции (обычно в ISO-формате).
    transactionDate: string;
    comment?: string | null;
}

// Данные для создания новой транзакции.
export interface TransactionCreatePayload {
    // Идентификатор счёта.
    accountId: string;
    // Идентификатор категории.
    categoryId: string;
    // Тип создаваемой транзакции.
    type: TransactionType;
    // Сумма транзакции в числовом формате.
    amount: number;
    // Дата транзакции.
    transactionDate: string;
    comment?: string | null;
}
