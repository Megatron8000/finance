import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { PieChartItem } from '../../types/analytics';
import { formatMoney, toNumber } from '../../utils/money';

const COLORS = [
    '#1e88e5', '#00acc1', '#43a047', '#fdd835',
    '#fb8c00', '#e53935', '#8e24aa', '#5e35b1',
    '#3949ab', '#00897b', '#7cb342', '#f4511e',
    '#6d4c41', '#546e7a', '#d81b60', '#039be5'
];

interface CategoryPieChartProps {
    data: PieChartItem[];
}

interface CategoryBarItem {
    category: string;
    amount: number;
    color: string;
}

const buildCategoryBars = (data: PieChartItem[]): CategoryBarItem[] => {
    const sorted = data
        .map((item) => ({ category: item.category, amount: toNumber(item.amount) }))
        .filter((item) => item.amount > 0)
        .sort((a, b) => b.amount - a.amount);
    const total = sorted.reduce((sum, item) => sum + item.amount, 0);
    const visible: CategoryBarItem[] = [];
    let otherAmount = 0;

    sorted.forEach((item, index) => {
        const share = total > 0 ? item.amount / total : 0;
        if (index >= 10 || (index >= 5 && share < 0.03)) {
            otherAmount += item.amount;
            return;
        }

        visible.push({ ...item, color: COLORS[visible.length % COLORS.length] });
    });

    if (otherAmount > 0) {
        visible.push({ category: 'Прочее', amount: otherAmount, color: '#90a4ae' });
    }

    return visible;
};

export const PieChart = ({ data }: CategoryPieChartProps) => {
    const chartData = buildCategoryBars(data);
    const total = chartData.reduce((sum, item) => sum + item.amount, 0);
    const maxAmount = Math.max(...chartData.map((item) => item.amount), 0);

    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={2} mb={2}>
                    <Typography variant="h6">
                        Структура по категориям
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {formatMoney(total)}
                    </Typography>
                </Stack>

                {chartData.length === 0 ? (
                    <Typography color="text.secondary">Нет данных за выбранный период.</Typography>
                ) : (
                    <Stack spacing={1.25}>
                        {chartData.map((item) => {
                            const percent = total > 0 ? item.amount / total * 100 : 0;
                            const width = maxAmount > 0 ? item.amount / maxAmount * 100 : 0;

                            return (
                                <Box key={item.category}>
                                    <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flex: '0 0 auto' }} />
                                        <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
                                            {item.category}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                                            {formatMoney(item.amount)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ width: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                            {percent.toFixed(percent >= 10 ? 0 : 1)}%
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ mt: 0.5, height: 8, borderRadius: 1, bgcolor: 'action.hover', overflow: 'hidden' }}>
                                        <Box sx={{ width: `${width}%`, height: 1, bgcolor: item.color, minWidth: width > 0 ? 3 : 0 }} />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};
