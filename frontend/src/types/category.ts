// Тип категории: доход или расход.
export type CategoryType = 'INCOME' | 'EXPENSE';

// Модель категории, используемая в приложении.
export interface Category {
    // Уникальный идентификатор категории.
    id: string;
    // Отображаемое название категории.
    name: string;
    // Тип категории (доход/расход).
    type: CategoryType;
    // Признак системной (предустановленной) категории.
    system: boolean;
}

// Данные для создания новой категории.
export interface CategoryCreatePayload {
    // Название новой категории.
    name: string;
    // Тип создаваемой категории.
    type: CategoryType;
}
