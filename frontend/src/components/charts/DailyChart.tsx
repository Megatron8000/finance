import { Card, CardContent, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyStats } from '../../types/analytics';
import { formatCompactNumber, formatMoney, toNumber } from '../../utils/money';

interface DailyChartProps {
    data: DailyStats[];
}

interface ChartPoint {
    date: string;
    income: number;
    expense: number;
}

const shortDate = (date: Date) =>
    `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`;

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const getWeekStart = (date: Date) => {
    const result = new Date(date);
    const day = result.getDay() || 7;
    result.setDate(result.getDate() - day + 1);
    return result;
};

const aggregateData = (data: DailyStats[]): ChartPoint[] => {
    const points = data.map((item) => ({
        date: item.date,
        income: toNumber(item.income),
        expense: toNumber(item.expense)
    }));

    if (points.length <= 21) {
        return points.map((item) => ({ ...item, date: shortDate(parseDate(item.date)) }));
    }

    const groups = new Map<string, ChartPoint>();
    const useMonths = points.length > 62;

    points.forEach((item) => {
        const date = parseDate(item.date);
        let key: string;

        if (useMonths) {
            key = `${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
        } else {
            const start = getWeekStart(date);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            key = `${shortDate(start)}-${shortDate(end)}`;
        }

        const group = groups.get(key) ?? { date: key, income: 0, expense: 0 };
        group.income += item.income;
        group.expense += item.expense;
        groups.set(key, group);
    });

    return Array.from(groups.values());
};

export const DailyChart = ({ data }: DailyChartProps) => {
    const chartData = aggregateData(data);
    const rotateLabels = chartData.length > 8;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Динамика доходов и расходов
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: rotateLabels ? 44 : 12, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            interval={0}
                            angle={rotateLabels ? -35 : 0}
                            textAnchor={rotateLabels ? 'end' : 'middle'}
                            height={rotateLabels ? 58 : 32}
                            tickMargin={12}
                        />
                        <YAxis tickFormatter={formatCompactNumber} width={58} />
                        <Tooltip formatter={(value, name) => [formatMoney(Number(value)), name === 'income' ? 'Доходы' : 'Расходы']} />
                        <Legend />
                        <Bar dataKey="income" fill="#2e7d32" name="Доходы" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#c62828" name="Расходы" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
