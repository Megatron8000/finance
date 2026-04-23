import { Card, CardContent, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyStats } from '../../types/analytics';
import { toNumber } from '../../utils/money';

interface DailyChartProps {
    data: DailyStats[];
}

export const DailyChart = ({ data }: DailyChartProps) => {
    // Приводим денежные значения к числам для корректного отображения столбцов.
    const chartData = data.map((item) => ({
        date: item.date,
        income: toNumber(item.income),
        expense: toNumber(item.expense)
    }));

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Динамика доходов и расходов
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        {/* Базовые элементы графика: сетка, оси, всплывающая подсказка и легенда. */}
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {/* Отдельные серии для доходов и расходов с разными цветами. */}
                        <Bar dataKey="income" fill="#2e7d32" name="Доходы" />
                        <Bar dataKey="expense" fill="#c62828" name="Расходы" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};