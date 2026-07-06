import { create } from 'zustand';
import { accountApi } from '../api/accountApi';
import type { Account, AccountCreatePayload, AccountUpdatePayload } from '../types/account';

interface AccountState {
    accounts: Account[];
    isLoading: boolean;
    error: string | null;
    fetchAccounts: () => Promise<void>;
    createAccount: (payload: AccountCreatePayload) => Promise<void>;
    updateAccount: (accountId: string, payload: AccountUpdatePayload) => Promise<void>;
    deleteAccount: (accountId: string) => Promise<void>;
}

const formatError = (error: unknown) =>
    error instanceof Error ? error.message : 'Ошибка загрузки счетов';

export const useAccountStore = create<AccountState>((set) => ({
    accounts: [],
    isLoading: false,
    error: null,
    fetchAccounts: async () => {
        set({ isLoading: true, error: null });
        try {
            const accounts = await accountApi.getAll();
            set({ accounts, isLoading: false });
        } catch (error) {
            set({ error: formatError(error), isLoading: false });
            throw error;
        }
    },
    createAccount: async (payload) => {
        set({ isLoading: true, error: null });
        try {
            const account = await accountApi.create(payload);
            set((state) => ({ accounts: [...state.accounts, account], isLoading: false }));
        } catch (error) {
            set({ error: formatError(error), isLoading: false });
            throw error;
        }
    },
    updateAccount: async (accountId, payload) => {
        set({ isLoading: true, error: null });
        try {
            const account = await accountApi.update(accountId, payload);
            set((state) => ({
                accounts: state.accounts.map((item) => item.id === account.id ? account : item),
                isLoading: false
            }));
        } catch (error) {
            set({ error: formatError(error), isLoading: false });
            throw error;
        }
    },
    deleteAccount: async (accountId) => {
        set({ isLoading: true, error: null });
        try {
            await accountApi.delete(accountId);
            set((state) => ({
                accounts: state.accounts.filter((account) => account.id !== accountId),
                isLoading: false
            }));
        } catch (error) {
            set({ error: formatError(error), isLoading: false });
            throw error;
        }
    }
}));
