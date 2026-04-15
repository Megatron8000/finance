import { api } from './axios';
import type { Account, AccountCreatePayload } from '../types/account';

// API-методы для работы со счетами.
export const accountApi = {
    // Получает список всех счетов.
    getAll: async () => {
        // GET /accounts -> Account[]
        const { data } = await api.get<Account[]>('/accounts');
        return data;
    },
    // Создаёт новый счёт.
    create: async (payload: AccountCreatePayload) => {
        // POST /accounts c телом запроса -> Account
        const { data } = await api.post<Account>('/accounts', payload);
        return data;
    }
};
