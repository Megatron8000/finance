import { Alert, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { DailyChart } from '../components/charts/DailyChart';
import { PieChart } from '../components/charts/PieChart';
import type { DailyStats, PieChartItem } from '../types/analytics';
import type { TransactionType } from '../types/transaction';
import { daysAgo, today } from '../utils/date';

export const AnalyticsPage = () => {
    // По умолчанию показываем статистику за последние 7 дней.
    const [from, setFrom] = useState(daysAgo(6));
    const [to, setTo] = useState(today());
    // Тип определяет, какие данные строятся для круговой диаграммы.
    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [pieData, setPieData] = useState<PieChartItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Загружаем оба набора данных параллельно, чтобы сократить время ожидания.
        Promise.all([
            analyticsApi.getDaily({ from, to }),
            analyticsApi.getPie({ from, to, type })
        ])
            .then(([daily, pie]) => {
                setDailyStats(daily);
                setPieData(pie);
                setError(null);
            })
            // Любая ошибка в одном из запросов отображается единым сообщением на странице.
            .catch((err: Error) => setError(err.message));
    }, [from, to, type]);

    return (
        <Stack spacing={3}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Card>
                <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField type="date" label="От" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                        <TextField type="date" label="До" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                        <TextField select label="Тип диаграммы" value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                            <MenuItem value="EXPENSE">Расходы</MenuItem>
                            <MenuItem value="INCOME">Доходы</MenuItem>
                        </TextField>
                    </Stack>
                </CardContent>
            </Card>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <DailyChart data={dailyStats} />
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <PieChart data={pieData} />
                </Grid>
            </Grid>
            <Typography color="text.secondary">Графики используют endpoints `/api/analytics/daily` и `/api/analytics/pie` с диапазоном дат.</Typography>
        </Stack>
    );
};
