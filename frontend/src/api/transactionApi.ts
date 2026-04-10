import { api } from './axios';
import type { TransactionCreatePayload } from '../types/transaction';

// Клиентский API для операций с транзакциями.
export const transactionApi = {
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
