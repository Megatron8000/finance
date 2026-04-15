import { create } from 'zustand';
import { accountApi } from '../api/accountApi';
import type { Account, AccountCreatePayload } from '../types/account';

interface AccountState {
    // Список счетов, загруженных с сервера.
    accounts: Account[];
    // Флаг глобальной загрузки для операций стора.
    isLoading: boolean;
    // Текст ошибки для отображения в UI.
    error: string | null;
    // Загружает все счета и сохраняет их в стор.
    fetchAccounts: () => Promise<void>;
    // Создаёт новый счёт и добавляет его в локальный список.
    createAccount: (payload: AccountCreatePayload) => Promise<void>;
}

// Приводит неизвестную ошибку к строке, понятной для интерфейса.
const formatError = (error: unknown) =>
    error instanceof Error ? error.message : 'Ошибка загрузки счетов';

export const useAccountStore = create<AccountState>((set) => ({
    accounts: [],
    isLoading: false,
    error: null,
    fetchAccounts: async () => {
        // Перед запросом сбрасываем ошибку и включаем состояние загрузки.
        set({ isLoading: true, error: null });
        try {
            const accounts = await accountApi.getAll();
            set({ accounts, isLoading: false });
        } catch (error) {
            // Сохраняем текст ошибки и пробрасываем её выше для обработчиков.
            set({ error: formatError(error), isLoading: false });
            throw error;
        }
    },
    createAccount: async (payload) => {
        // При создании счёта также показываем общий индикатор загрузки.
        set({ isLoading: true, error: null });
        try {
            const account = await accountApi.create(payload);
            // Добавляем новый счёт в конец локального списка.
            set((state) => ({ accounts: [...state.accounts, account], isLoading: false }));
        } catch (error) {
            set({ error: formatError(error), isLoading: false });
            throw error;
        }
    }
}));
