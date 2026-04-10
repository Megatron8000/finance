import { create } from 'zustand';
import { transactionApi } from '../api/transactionApi';
import type { Transaction, TransactionCreatePayload } from '../types/transaction';

// Контракт состояния и действий стора транзакций.
interface TransactionState {
    // Текущий список транзакций в памяти клиента.
    transactions: Transaction[];
    // Флаг выполнения операции создания/удаления.
    isSaving: boolean;
    // Текст последней ошибки операции.
    error: string | null;
    // Добавляет транзакцию через API и обновляет локальный список.
    addTransaction: (payload: TransactionCreatePayload, metadata?: Partial<Transaction>) => Promise<void>;
    // Удаляет транзакцию через API и из локального списка.
    removeTransaction: (id: string) => Promise<void>;
}

// Нормализует ошибку в читаемое сообщение для UI.
const formatError = (error: unknown) =>
    error instanceof Error ? error.message : 'Ошибка операции с транзакцией';

// Zustand-стор для управления транзакциями на клиенте.
export const useTransactionStore = create<TransactionState>((set) => ({
    transactions: [],
    isSaving: false,
    error: null,
    addTransaction: async (payload, metadata = {}) => {
        set({ isSaving: true, error: null });
        try {
            const id = await transactionApi.create(payload);
            set((state) => ({
                transactions: [
                    {
                        id,
                        ...metadata,
                        ...payload,
                        amount: payload.amount.toString()
                    },
                    ...state.transactions
                ],
                isSaving: false
            }));
        } catch (error) {
            set({ error: formatError(error), isSaving: false });
            throw error;
        }
    },
    removeTransaction: async (id) => {
        set({ isSaving: true, error: null });
        try {
            await transactionApi.remove(id);
            set((state) => ({
                transactions: state.transactions.filter((item) => item.id !== id),
                isSaving: false
            }));
        } catch (error) {
            set({ error: formatError(error), isSaving: false });
            throw error;
        }
    }
}));
