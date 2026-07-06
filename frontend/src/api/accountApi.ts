import { api } from './axios';
import type { Account, AccountCreatePayload, AccountUpdatePayload } from '../types/account';

export const accountApi = {
    getAll: async () => {
        const { data } = await api.get<Account[]>('/accounts');
        return data;
    },
    create: async (payload: AccountCreatePayload) => {
        const { data } = await api.post<Account>('/accounts', payload);
        return data;
    },
    update: async (accountId: string, payload: AccountUpdatePayload) => {
        const { data } = await api.put<Account>(`/accounts/${accountId}`, payload);
        return data;
    },
    delete: async (accountId: string) => {
        await api.delete(`/accounts/${accountId}`);
    }
};
