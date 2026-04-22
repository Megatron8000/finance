import { Card, CardContent, Typography } from '@mui/material';
import { Cell, Legend, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PieChartItem } from '../../types/analytics';
import { toNumber } from '../../utils/money';

// Базовая палитра цветов для секторов диаграммы.
const COLORS = ['#1565c0', '#00897b', '#ef6c00', '#8e24aa', '#c62828'];

interface CategoryPieChartProps {
    data: PieChartItem[];
}

export const PieChart = ({ data }: CategoryPieChartProps) => {
    // Приводим amount к числу, чтобы корректно построить график в Recharts.
    const chartData = data.map((item) => ({ ...item, amount: toNumber(item.amount) }));

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Структура по категориям
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                        <Pie data={chartData} dataKey="amount" nameKey="category" outerRadius={100} label>
                            {chartData.map((entry, index) => (
                                <Cell key={`${entry.category}-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
