import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Alert, Card, CardContent, Chip, Grid, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { categoryApi } from '../api/categoryApi';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { TransactionForm } from '../components/forms/TransactionForm';
import { useConfirm } from '../hooks/useConfirm';
import { useAccountStore } from '../store/accountStore';
import { useTransactionStore } from '../store/transactionStore';
import type { Category } from '../types/category';
import { formatDate } from '../utils/date';
import { formatMoney } from '../utils/money';

export const TransactionsPage = () => {
    // Данные счетов и операций из стора.
    const { accounts, fetchAccounts } = useAccountStore();
    const { transactions, addTransaction, removeTransaction, error } = useTransactionStore();
    // Локальные категории и возможная ошибка их загрузки.
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    // Состояние и API диалога подтверждения удаления.
    const { open, confirm, handleClose } = useConfirm();

    useEffect(() => {
        // Загружаем счета и обе группы категорий при открытии страницы.
        void fetchAccounts();
        Promise.all([categoryApi.getByType('INCOME'), categoryApi.getByType('EXPENSE')])
            .then(([income, expense]) => setCategories([...income, ...expense]))
            .catch((err: Error) => setCategoriesError(err.message));
    }, [fetchAccounts]);

    const handleAddTransaction = async (payload: Parameters<typeof addTransaction>[0]) => {
        // Подставляем человекочитаемые названия счета и категории для отображения в таблице.
        const account = accounts.find((item) => item.id === payload.accountId);
        const category = categories.find((item) => item.id === payload.categoryId);

        await addTransaction(payload, {
            accountName: account?.name,
            categoryName: category?.name
        });
    };

    const handleDelete = async (id: string) => {
        // Удаляем запись только после подтверждения пользователя.
        const accepted = await confirm();
        if (accepted) {
            await removeTransaction(id);
        }
    };

    // Форму можно показать только когда есть и счета, и категории.
    const canCreate = useMemo(() => accounts.length > 0 && categories.length > 0, [accounts.length, categories.length]);

    return (
        <Stack spacing={3}>
            {/* Ошибки из операций/категорий показываем отдельными уведомлениями. */}
            {error ? <Alert severity="error">{error}</Alert> : null}
            {categoriesError ? <Alert severity="warning">{categoriesError}</Alert> : null}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Новая транзакция</Typography>
                            {canCreate ? (
                                <TransactionForm accounts={accounts} categories={categories} onSubmit={handleAddTransaction} />
                            ) : (
                                <Alert severity="info">Сначала создайте счёт и убедитесь, что backend возвращает категории.</Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 8 }}>
                    {/* Таблица локального списка транзакций. */}
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Локальный журнал транзакций</Typography>
                                <Chip label={`${transactions.length} записей`} color="primary" variant="outlined" />
                            </Stack>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Дата</TableCell>
                                        <TableCell>Счёт</TableCell>
                                        <TableCell>Категория</TableCell>
                                        <TableCell>Тип</TableCell>
                                        <TableCell align="right">Сумма</TableCell>
                                        <TableCell align="right">Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.id} hover>
                                            <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                                            <TableCell>{transaction.accountName ?? transaction.accountId}</TableCell>
                                            <TableCell>{transaction.categoryName ?? transaction.categoryId}</TableCell>
                                            <TableCell>{transaction.type}</TableCell>
                                            <TableCell align="right">{formatMoney(transaction.amount)}</TableCell>
                                            <TableCell align="right">
                                                <IconButton color="error" onClick={() => void handleDelete(transaction.id)}>
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {transactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                {/* Подсказка, пока список операций пуст. */}
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

            {/* Подтверждение удаления транзакции. */}
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
