import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Alert, Card, CardContent, Chip, Grid, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { categoryApi } from '../api/categoryApi';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TransactionForm } from '../components/forms/TransactionForm';
import { useConfirm } from '../hooks/useConfirm';
import { useAccountStore } from '../store/accountStore';
import { useTransactionStore } from '../store/transactionStore';
import type { Category } from '../types/category';
import { CurrencyFlag } from '../components/common/CurrencyFlag';
import { formatDate } from '../utils/date';
import { formatMoney } from '../utils/money';

export const TransactionsPage = () => {
    const { accounts, fetchAccounts } = useAccountStore();
    const { transactions, addTransaction, removeTransaction, error } = useTransactionStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const { open, confirm, handleClose } = useConfirm();

    useEffect(() => {
        void fetchAccounts();
        Promise.all([categoryApi.getByType('INCOME'), categoryApi.getByType('EXPENSE')])
            .then(([income, expense]) => setCategories([...income, ...expense]))
            .catch((err: Error) => setCategoriesError(err.message));
    }, [fetchAccounts]);

    const handleAddTransaction = async (payload: Parameters<typeof addTransaction>[0]) => {
        const account = accounts.find((item) => item.id === payload.accountId);
        const category = categories.find((item) => item.id === payload.categoryId);

        await addTransaction(payload, {
            accountName: account?.name,
            categoryName: category?.name
        });
    };

    const handleDelete = async (id: string) => {
        const accepted = await confirm();
        if (accepted) {
            await removeTransaction(id);
        }
    };

    const handleCategoryCreated = (category: Category) => {
        setCategories((prev) => [...prev, category]);
    };

    const canCreate = accounts.length > 0;

    return (
        <Stack spacing={3}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {categoriesError ? <Alert severity="warning">{categoriesError}</Alert> : null}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Новая транзакция</Typography>
                            {canCreate ? (
                                <TransactionForm accounts={accounts} categories={categories} onCategoryCreated={handleCategoryCreated} onSubmit={handleAddTransaction} />
                            ) : (
                                <Alert severity="info">Сначала создайте счёт на дашборде.</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Журнал транзакций</Typography>
                                <Chip label={`${transactions.length} записей`} color="primary" variant="outlined" />
                            </Stack>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Дата</TableCell>
                                        <TableCell>Счёт</TableCell>
                                        <TableCell>Категория</TableCell>
                                        <TableCell>Тип</TableCell>
                                        <TableCell>Комментарий</TableCell>
                                        <TableCell align="right">Сумма</TableCell>
                                        <TableCell align="right">Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((transaction) => {
                                        const cur = transaction.accountCurrency;
                                        return (
                                            <TableRow key={transaction.id} hover>
                                                <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        {cur && <CurrencyFlag currency={cur} size={16} />}
                                                        <span>{transaction.accountName ?? transaction.accountId}</span>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>{transaction.categoryName ?? transaction.categoryId}</TableCell>
                                                <TableCell>{transaction.type === 'INCOME' ? 'Пополнение' : 'Расход'}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color={transaction.comment ? 'text.primary' : 'text.secondary'}>
                                                        {transaction.comment || '-'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {formatMoney(transaction.amount, cur)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton color="error" onClick={() => void handleDelete(transaction.id)}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7}>
                                                <Typography color="text.secondary">Добавленные через форму транзакции будут отображаться здесь.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : null}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={open}
                title="Удалить транзакцию?"
                description="Удаление выполнит DELETE-запрос в backend и уберёт запись из локального списка."
                onCancel={() => handleClose(false)}
                onConfirm={() => handleClose(true)}
            />
        </Stack>
    );
};
