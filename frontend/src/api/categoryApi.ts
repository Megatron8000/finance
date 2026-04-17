import { api } from './axios';
import type { Category, CategoryCreatePayload, CategoryType } from '../types/category';

export const categoryApi = {
    // Получает список категорий по переданному типу (например, доход/расход).
    getByType: async (type: CategoryType) => {
        // Отправляем type как query-параметр и ожидаем массив категорий.
        const { data } = await api.get<Category[]>('/categories', { params: { type } });
        // Возвращаем только полезные данные из ответа.
        return data;
    },
    // Создаёт новую категорию на сервере по данным формы.
    create: async (payload: CategoryCreatePayload) => {
        // В теле запроса передаём payload, в ответ получаем созданную категорию.
        const { data } = await api.post<Category>('/categories', payload);
        // Возвращаем объект созданной категории.
        return data;
    }
};
