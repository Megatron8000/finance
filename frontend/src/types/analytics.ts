import type { TransactionType } from './transaction';

export interface BalanceSummary {
    // Общий текущий баланс пользователя.
    totalBalance: string;
}

export interface DailyStats {
    // Дата, за которую рассчитана статистика.
    date: string;
    // Сумма доходов за день.
    income: string;
    // Сумма расходов за день.
    expense: string;
}

export interface PieChartItem {
    // Название категории операции.
    category: string;
    // Сумма по категории.
    amount: string;
}

export interface DateRange {
    // Начальная дата периода (включительно).
    from: string;
    // Конечная дата периода (включительно).
    to: string;
}

export interface PieQuery extends DateRange {
    // Тип операций для фильтрации (доходы или расходы).
    type: TransactionType;
}
