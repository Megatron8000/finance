import { api } from './axios';
import type { Transaction, TransactionCreatePayload } from '../types/transaction';

// Клиентский API для операций с транзакциями.
export const transactionApi = {
    // Получает список транзакций за период.
    getAll: async (from: string, to: string) => {
        const { data } = await api.get<Transaction[]>('/transactions', { params: { from, to } });
        return data;
    },
    // Создаёт новую транзакцию и возвращает её идентификатор.
    create: async (payload: TransactionCreatePayload) => {
        const { data } = await api.post<string>('/transactions', payload);
        return data;
    },
    // Удаляет транзакцию по её идентификатору.
    remove: async (id: string) => {
        await api.delete(`/transactions/${id}`);
    }
};
