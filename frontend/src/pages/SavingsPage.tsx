import { Alert, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { savingsApi } from '../api/savingsApi';
import { SavingsForm } from '../components/forms/SavingsForm';
import { useAccountStore } from '../store/accountStore';

export const SavingsPage = () => {
    const { accounts, fetchAccounts } = useAccountStore();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Загружаем список счетов при открытии страницы.
    useEffect(() => {
        void fetchAccounts();
    }, [fetchAccounts]);

    // Оставляем только накопительные счета для операций капитализации.
    const savingsAccounts = useMemo(
        () => accounts.filter((account) => account.type === 'SAVINGS'),
        [accounts]
    );

    // Выполняем капитализацию по выбранному счету и показываем результат операции.
    const handleCapitalize = async (accountId: string) => {
        try {
            await savingsApi.capitalize(accountId);
            setMessage('Капитализация успешно выполнена.');
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не удалось выполнить капитализацию');
            setMessage(null);
        }
    };

    return (
        <Stack spacing={3}>
            {/* Сообщения об успешной операции и ошибках API. */}
            {message ? <Alert severity="success">{message}</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <Typography variant="h6">Капитализация по накопительным счетам</Typography>
                        {savingsAccounts.length > 0 ? (
                            <SavingsForm accounts={savingsAccounts} onSubmit={handleCapitalize} />
                        ) : (
                            <Alert severity="info">Добавьте счёт типа SAVINGS на дашборде, чтобы использовать этот раздел.</Alert>
                        )}
                    </Stack>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        {/* Быстрый список всех доступных накопительных счетов. */}
                        <Typography variant="h6">Доступные накопительные счета</Typography>
                        <Stack direction="row" gap={1} flexWrap="wrap">
                            {savingsAccounts.map((account) => (
                                <Chip key={account.id} label={account.name} color="secondary" variant="outlined" />
                            ))}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
};
