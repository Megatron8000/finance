import type { CategoryType } from './category';
import type { Currency } from './account';

export type TransactionType = CategoryType | 'TRANSFER';

export interface Transaction {
    id: string;
    accountId: string;
    accountName?: string;
    accountCurrency?: Currency;
    categoryId: string;
    categoryName?: string;
    type: TransactionType;
    amount: string;
    amountInRub?: string;
    exchangeRate?: string;
    transactionDate: string;
    createdAt?: string;
    comment?: string | null;
}

export interface TransactionCreatePayload {
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    transactionDate: string;
    comment?: string | null;
    amountInRub?: number | null;
}

export interface TransferPayload {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    transactionDate: string;
    comment?: string | null;
}
