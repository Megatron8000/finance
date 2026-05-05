import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';
import { Alert, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { BalanceChart } from '../components/charts/BalanceChart';
import { AccountForm } from '../components/forms/AccountForm';
import { Loader } from '../components/common/Loader';
import { useAccountStore } from '../store/accountStore';
import { formatMoney, toNumber } from '../utils/money';

export const DashboardPage = () => {
    const { accounts, fetchAccounts, createAccount, isLoading, error } = useAccountStore();
    const [totalBalance, setTotalBalance] = useState('0');
    const [balanceError, setBalanceError] = useState<string | null>(null);

    useEffect(() => {
        // При открытии страницы загружаем счета и агрегированный общий баланс.
        void fetchAccounts();
        void analyticsApi.getBalance().then((data) => setTotalBalance(data.totalBalance)).catch((err: Error) => setBalanceError(err.message));
    }, [fetchAccounts]);

    // Пересчитываем количество накопительных счетов только при изменении списка счетов.
    const savingsCount = useMemo(
        () => accounts.filter((account) => account.type === 'SAVINGS').length,
        [accounts]
    );

    // Для первого рендера показываем лоадер, пока данные еще не пришли.
    if (isLoading && accounts.length === 0) {
        return <Loader />;
    }

    return (
        <Stack spacing={3}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {balanceError ? <Alert severity="warning">{balanceError}</Alert> : null}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>Общий баланс</Typography>
                            <Typography variant="h4" fontWeight={700}>{formatMoney(totalBalance)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>Количество счетов</Typography>
                            <Typography variant="h4" fontWeight={700}>{accounts.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>Накопительных счетов</Typography>
                            <Typography variant="h4" fontWeight={700}>{savingsCount}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <BalanceChart accounts={accounts} />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <AddCardOutlinedIcon color="primary" />
                                    <Typography variant="h6">Добавить счёт</Typography>
                                </Stack>
                                <AccountForm onSubmit={createAccount} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <Typography variant="h6">Список счетов</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {/* Каждый счет отображаем отдельным чипом с названием и балансом. */}
                            {accounts.map((account) => (
                                <Chip key={account.id} label={`${account.name} · ${formatMoney(toNumber(account.balance))}`} color="primary" variant="outlined" />
                            ))}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
};
