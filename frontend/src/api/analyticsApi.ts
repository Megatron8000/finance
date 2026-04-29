import { api } from './axios';
import type { BalanceSummary, DailyStats, DateRange, PieChartItem, PieQuery } from '../types/analytics';

// Методы для получения аналитических данных с бэкенда.
export const analyticsApi = {
    // Возвращает сводный баланс (доходы, расходы, итог).
    getBalance: async () => {
        const { data } = await api.get<BalanceSummary>('/analytics/balance');
        return data;
    },
    // Возвращает дневную статистику за указанный диапазон дат.
    getDaily: async (params: DateRange) => {
        const { data } = await api.get<DailyStats[]>('/analytics/daily', { params });
        return data;
    },
    // Возвращает данные для круговой диаграммы по заданным параметрам.
    getPie: async (params: PieQuery) => {
        const { data } = await api.get<PieChartItem[]>('/analytics/pie', { params });
        return data;
    }
};
