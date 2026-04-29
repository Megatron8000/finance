import { api } from './axios';

// Метод для работы с накопительными счетами.
export const savingsApi = {
    // Выполняет капитализацию процентов по указанному накопительному счету.
    capitalize: async (accountId: string) => {
        await api.post(`/savings/${accountId}/capitalize`);
    }
};
