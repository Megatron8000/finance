import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { categoryApi } from '../api/categoryApi';
import { savingsApi } from '../api/savingsApi';
import { transactionApi } from '../api/transactionApi';
import { BalanceChart } from '../components/charts/BalanceChart';
import { DailyChart } from '../components/charts/DailyChart';
import { PieChart } from '../components/charts/PieChart';
import { AccountFilter } from '../components/common/AccountFilter';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Loader } from '../components/common/Loader';
import { CurrencyFlag } from '../components/common/CurrencyFlag';
import { AccountForm } from '../components/forms/AccountForm';
import { SavingsForm } from '../components/forms/SavingsForm';
import { TransactionForm } from '../components/forms/TransactionForm';
import { useConfirm } from '../hooks/useConfirm';
import { useAccountStore } from '../store/accountStore';
import { useTransactionStore } from '../store/transactionStore';
import type { Account, AccountCreatePayload, Currency } from '../types/account';
import { ACCOUNT_TYPE_LABELS, CURRENCY_META } from '../types/account';
import type { Category } from '../types/category';
import type { DailyStats, PieChartItem } from '../types/analytics';
import type { Transaction, TransactionType, MergedTransfer } from '../types/transaction';
import { today, daysAgo } from '../utils/date';
import { formatMoney, toNumber } from '../utils/money';

const FALLBACK_RATES_TO_RUB: Record<Currency, number> = {
    RUB: 1, USD: 90.00, CNY: 12.50, BYN: 28.00, AED: 24.50,
};

type JournalEntry = MergedTransfer | Transaction;

function isTransfer(entry: JournalEntry): entry is MergedTransfer {
    return 'kind' in entry && entry.kind === 'transfer';
}

function mergeTransfers(transactions: Transaction[]): JournalEntry[] {
    const result: JournalEntry[] = [];
    const used = new Set<string>();

    for (const tx of transactions) {
        if (used.has(tx.id)) continue;
        if (tx.categoryName !== 'Перевод между счетами') {
            result.push(tx);
            continue;
        }
        const paired = tx.type === 'EXPENSE'
            ? transactions.find((t) => t.id !== tx.id && !used.has(t.id) && t.categoryName === 'Перевод между счетами' && t.type === 'INCOME' && t.createdAt === tx.createdAt)
            : transactions.find((t) => t.id !== tx.id && !used.has(t.id) && t.categoryName === 'Перевод между счетами' && t.type === 'EXPENSE' && t.createdAt === tx.createdAt);
        if (paired) {
            const expense = tx.type === 'EXPENSE' ? tx : paired;
            const income = tx.type === 'INCOME' ? tx : paired;
            result.push({
                kind: 'transfer',
                id: expense.id,
                date: expense.transactionDate,
                fromAccountName: expense.accountName ?? expense.accountId,
                fromAccountCurrency: expense.accountCurrency,
                fromAmount: expense.amount,
                toAccountName: income.accountName ?? income.accountId,
                toAccountCurrency: income.accountCurrency,
                toAmount: income.amount,
                comment: expense.comment,
                expenseId: expense.id,
                incomeId: income.id,
            });
            used.add(expense.id);
            used.add(income.id);
        } else {
            result.push(tx);
        }
    }
    return result;
}

function computeTotalBalanceRUB(accounts: Account[]): number {
    return accounts.reduce((sum, a) => sum + toNumber(a.balance) * FALLBACK_RATES_TO_RUB[a.currency], 0);
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography variant="h6" fontWeight={700}>{children}</Typography>
);

export const MainPage = () => {
    const { accounts, fetchAccounts, createAccount, updateAccount, deleteAccount, isLoading: accountsLoading } = useAccountStore();
    const { transactions, fetchTransactions, addTransaction, removeTransaction, isLoading: txLoading } = useTransactionStore();

    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [overviewSelectedAccountIds, setOverviewSelectedAccountIds] = useState<string[]>([]);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const confirmDelete = useConfirm();

    const [categories, setCategories] = useState<Category[]>([]);
    const [txDateFrom, setTxDateFrom] = useState(today());
    const [txDateTo, setTxDateTo] = useState(today());

    const [analyticsFrom, setAnalyticsFrom] = useState(daysAgo(6));
    const [analyticsTo, setAnalyticsTo] = useState(today());
    const [analyticsType, setAnalyticsType] = useState<TransactionType>('EXPENSE');
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [pieData, setPieData] = useState<PieChartItem[]>([]);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);

    const [savingsMessage, setSavingsMessage] = useState<string | null>(null);
    const [savingsError, setSavingsError] = useState<string | null>(null);

    useEffect(() => {
        void fetchAccounts();
        Promise.all([categoryApi.getByType('INCOME'), categoryApi.getByType('EXPENSE')])
            .then(([income, expense]) => setCategories([...income, ...expense]))
            .catch(() => {});
    }, [fetchAccounts]);

    useEffect(() => {
        if (accounts.length > 0 && selectedAccountIds.length === 0) {
            setSelectedAccountIds(accounts.map((a) => a.id));
        }
        if (accounts.length > 0 && overviewSelectedAccountIds.length === 0) {
            const salaryAccount = accounts.find((a) => a.name.toLowerCase().includes('зарплат'));
            setOverviewSelectedAccountIds(salaryAccount ? [salaryAccount.id] : [accounts[0].id]);
        }
    }, [accounts, selectedAccountIds.length, overviewSelectedAccountIds.length]);

    useEffect(() => {
        if (txDateFrom && txDateTo) {
            void fetchTransactions(txDateFrom, txDateTo);
        }
    }, [txDateFrom, txDateTo, fetchTransactions]);

    useEffect(() => {
        Promise.all([
            analyticsApi.getDaily({ from: analyticsFrom, to: analyticsTo }),
            analyticsApi.getPie({ from: analyticsFrom, to: analyticsTo, type: analyticsType })
        ])
            .then(([daily, pie]) => { setDailyStats(daily); setPieData(pie); setAnalyticsError(null); })
            .catch((err: Error) => setAnalyticsError(err.message));
    }, [analyticsFrom, analyticsTo, analyticsType]);

    const filteredAccounts = useMemo(
        () => accounts.filter((a) => selectedAccountIds.includes(a.id)),
        [accounts, selectedAccountIds]
    );
    const overviewFilteredAccounts = useMemo(
        () => accounts.filter((a) => overviewSelectedAccountIds.includes(a.id)),
        [accounts, overviewSelectedAccountIds]
    );
    const overviewTotalBalance = useMemo(() => computeTotalBalanceRUB(overviewFilteredAccounts), [overviewFilteredAccounts]);
    const savingsAccounts = useMemo(() => accounts.filter((a) => a.type === 'SAVINGS'), [accounts]);
    const journalEntries = useMemo(() => mergeTransfers(transactions).reverse(), [transactions]);

    const handleCreateAccount = async (payload: AccountCreatePayload) => { await createAccount(payload); };
    const handleUpdateAccount = async (payload: AccountCreatePayload) => {
        if (!editingAccount) return;
        await updateAccount(editingAccount.id, payload);
        setEditingAccount(null);
    };
    const handleDeleteAccount = async (account: Account) => {
        const accepted = await confirmDelete.confirm();
        if (!accepted) return;
        await deleteAccount(account.id);
    };

    const handleAddTransaction = async (payload: Parameters<typeof addTransaction>[0]) => {
        const account = accounts.find((a) => a.id === payload.accountId);
        const category = categories.find((c) => c.id === payload.categoryId);
        await addTransaction(payload, { accountName: account?.name, categoryName: category?.name, accountCurrency: account?.currency });
        if (txDateFrom && txDateTo) void fetchTransactions(txDateFrom, txDateTo);
        void fetchAccounts();
    };
    const handleTransfer = async (payload: { fromAccountId: string; toAccountId: string; amount: number; transactionDate: string; comment?: string | null }) => {
        await transactionApi.transfer(payload);
        if (txDateFrom && txDateTo) void fetchTransactions(txDateFrom, txDateTo);
        void fetchAccounts();
    };
    const handleDeleteTransaction = async (id: string, pairedId?: string) => {
        const accepted = await confirmDelete.confirm();
        if (accepted) {
            await removeTransaction(id);
            if (pairedId) await removeTransaction(pairedId);
            if (txDateFrom && txDateTo) void fetchTransactions(txDateFrom, txDateTo);
            void fetchAccounts();
        }
    };

    const handleCapitalize = async (accountId: string) => {
        try {
            await savingsApi.capitalize(accountId);
            setSavingsMessage('Капитализация успешно выполнена.');
            setSavingsError(null);
            void fetchAccounts();
        } catch (err) {
            setSavingsError(err instanceof Error ? err.message : 'Не удалось выполнить капитализацию');
            setSavingsMessage(null);
        }
    };

    if (accountsLoading && accounts.length === 0) return <Loader />;

    return (
        <Stack spacing={4}>
            <SectionTitle>Обзор</SectionTitle>

            {accounts.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <AccountFilter accounts={accounts} selectedIds={overviewSelectedAccountIds} onChange={setOverviewSelectedAccountIds} />
                </Box>
            )}

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card><CardContent>
                        <Typography color="text.secondary" gutterBottom>Общий баланс (₽)</Typography>
                        <Typography variant="h4" fontWeight={700}>{formatMoney(overviewTotalBalance)}</Typography>
                    </CardContent></Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card><CardContent>
                        <Typography color="text.secondary" gutterBottom>Количество счетов</Typography>
                        <Typography variant="h4" fontWeight={700}>{overviewFilteredAccounts.length}</Typography>
                    </CardContent></Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card><CardContent>
                        <Typography color="text.secondary" gutterBottom>Накопительных счетов</Typography>
                        <Typography variant="h4" fontWeight={700}>{overviewFilteredAccounts.filter((a) => a.type === 'SAVINGS').length}</Typography>
                    </CardContent></Card>
                </Grid>
            </Grid>

            <Divider />

            <SectionTitle>Транзакции</SectionTitle>

            <Grid container spacing={3} alignItems="stretch">
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ display: 'flex', flexDirection: 'column' }}><CardContent sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>Новая транзакция</Typography>
                        {accounts.length > 0 ? (
                            <TransactionForm accounts={accounts} categories={categories} onCategoryCreated={(c) => setCategories((p) => [...p, c])} onSubmit={handleAddTransaction} onTransfer={handleTransfer} />
                        ) : (
                            <Alert severity="info">Сначала создайте счёт.</Alert>
                        )}
                    </CardContent></Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                                <Typography variant="h6">Журнал транзакций</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TextField label="С" type="date" size="small" value={txDateFrom} onChange={(e) => setTxDateFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }} />
                                    <TextField label="По" type="date" size="small" value={txDateTo} onChange={(e) => setTxDateTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }} />
                                    <Chip label={`${journalEntries.length} записей`} color="primary" variant="outlined" />
                                </Stack>
                            </Stack>
                            <Box sx={{ maxHeight: 480, overflow: 'auto' }}>
                                {txLoading ? (
                                    <Typography color="text.secondary" textAlign="center">Загрузка...</Typography>
                                ) : journalEntries.length === 0 ? (
                                    <Typography color="text.secondary">Нет транзакций за выбранный период.</Typography>
                                ) : (
                                    <Stack spacing={1}>
                                        {journalEntries.map((entry) => {
                                            if (isTransfer(entry)) {
                                                return (
                                                    <Box key={entry.id} sx={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px 1fr 40px', gap: 1, alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1, px: 2, py: 1, fontSize: 14 }}>
                                                        <Typography variant="body2">{entry.date}</Typography>
                                                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                                                            {entry.fromAccountCurrency && <CurrencyFlag currency={entry.fromAccountCurrency} size={14} />}
                                                            <Typography variant="body2" noWrap>{entry.fromAccountName}</Typography>
                                                            <Typography variant="body2" color="text.secondary">→</Typography>
                                                            {entry.toAccountCurrency && <CurrencyFlag currency={entry.toAccountCurrency} size={14} />}
                                                            <Typography variant="body2" noWrap>{entry.toAccountName}</Typography>
                                                        </Stack>
                                                        <Chip label="Перевод" size="small" color="info" variant="outlined" />
                                                        <Typography variant="body2" textAlign="right" noWrap>
                                                            {formatMoney(entry.fromAmount, entry.fromAccountCurrency)} → {formatMoney(entry.toAmount, entry.toAccountCurrency)}
                                                        </Typography>
                                                        <IconButton color="error" size="small" onClick={() => void handleDeleteTransaction(entry.expenseId, entry.incomeId)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                                                    </Box>
                                                );
                                            }
                                            return (
                                                <Box key={entry.id} sx={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 80px 100px 40px', gap: 1, alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1, px: 2, py: 1, fontSize: 14 }}>
                                                    <Typography variant="body2">{entry.transactionDate}</Typography>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        {entry.accountCurrency && <CurrencyFlag currency={entry.accountCurrency} size={16} />}
                                                        <Typography variant="body2" noWrap>{entry.accountName ?? entry.accountId}</Typography>
                                                    </Stack>
                                                    <Typography variant="body2" noWrap>{entry.categoryName ?? entry.categoryId}</Typography>
                                                    <Chip label={entry.type === 'INCOME' ? 'Пополнение' : 'Расход'} size="small" color={entry.type === 'INCOME' ? 'success' : 'error'} variant="outlined" />
                                                    <Typography variant="body2" textAlign="right">{formatMoney(entry.amount, entry.accountCurrency)}</Typography>
                                                    <IconButton color="error" size="small" onClick={() => void handleDeleteTransaction(entry.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                                                </Box>
                                            );
                                        })}
                                    </Stack>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider />

            <SectionTitle>Счета</SectionTitle>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card><CardContent>
                        <Stack spacing={2}>
                            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                                <Stack spacing={1.5}>
                                    {accounts.map((account) => {
                                        const curMeta = CURRENCY_META[account.currency];
                                        return (
                                            <Box key={account.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '1fr auto auto' }, gap: 1, alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1, px: 2, py: 1.25 }}>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <CurrencyFlag currency={account.currency} />
                                                        <Typography fontWeight={600} noWrap>{account.name}</Typography>
                                                    </Stack>
                                                    <Typography variant="body2" color="text.secondary">{ACCOUNT_TYPE_LABELS[account.type]} · {curMeta.symbol}</Typography>
                                                </Box>
                                                <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>{formatMoney(toNumber(account.balance), account.currency)}</Typography>
                                                <Stack direction="row" spacing={0.5} sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' }, justifySelf: { xs: 'end', sm: 'auto' } }}>
                                                    <Tooltip title="Редактировать"><IconButton onClick={() => setEditingAccount(account)}><EditOutlinedIcon /></IconButton></Tooltip>
                                                    <Tooltip title="Удалить"><IconButton color="error" onClick={() => void handleDeleteAccount(account)}><DeleteOutlineIcon /></IconButton></Tooltip>
                                                </Stack>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        </Stack>
                    </CardContent></Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card><CardContent>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AddCardOutlinedIcon color="primary" />
                                <Typography variant="h6">Добавить счёт</Typography>
                            </Stack>
                            <AccountForm onSubmit={handleCreateAccount} />
                        </Stack>
                    </CardContent></Card>
                </Grid>
            </Grid>

            <Divider />

            <SectionTitle>Аналитика</SectionTitle>

            {accounts.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <AccountFilter accounts={accounts} selectedIds={selectedAccountIds} onChange={setSelectedAccountIds} />
                </Box>
            )}

            <BalanceChart accounts={filteredAccounts} />

            <Card><CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
                    <TextField type="date" label="От" value={analyticsFrom} onChange={(e) => setAnalyticsFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <TextField type="date" label="До" value={analyticsTo} onChange={(e) => setAnalyticsTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <TextField select label="Тип диаграммы" value={analyticsType} onChange={(e) => setAnalyticsType(e.target.value as TransactionType)}>
                        <MenuItem value="EXPENSE">Расходы</MenuItem>
                        <MenuItem value="INCOME">Доходы</MenuItem>
                    </TextField>
                </Stack>
                {analyticsError ? <Alert severity="error" sx={{ mb: 2 }}>{analyticsError}</Alert> : null}
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, lg: 7 }}><DailyChart data={dailyStats} /></Grid>
                    <Grid size={{ xs: 12, lg: 5 }}><PieChart data={pieData} /></Grid>
                </Grid>
            </CardContent></Card>

            <Divider />

            <SectionTitle>Накопления</SectionTitle>

            {savingsMessage ? <Alert severity="success">{savingsMessage}</Alert> : null}
            {savingsError ? <Alert severity="error">{savingsError}</Alert> : null}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card><CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6">Капитализация</Typography>
                            {savingsAccounts.length > 0 ? (
                                <SavingsForm accounts={savingsAccounts} onSubmit={handleCapitalize} />
                            ) : (
                                <Alert severity="info">Добавьте счёт типа «Сбережения».</Alert>
                            )}
                        </Stack>
                    </CardContent></Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card><CardContent>
                        <Stack spacing={2}>
                            <Typography variant="h6">Накопительные счета</Typography>
                            <Stack direction="row" gap={1} flexWrap="wrap">
                                {savingsAccounts.map((a) => (
                                    <Chip key={a.id} label={`${a.name} — ${formatMoney(toNumber(a.balance), a.currency)}`} color="secondary" variant="outlined" />
                                ))}
                                {savingsAccounts.length === 0 && <Typography color="text.secondary">Нет накопительных счетов.</Typography>}
                            </Stack>
                        </Stack>
                    </CardContent></Card>
                </Grid>
            </Grid>

            <Dialog open={!!editingAccount} onClose={() => setEditingAccount(null)} fullWidth maxWidth="sm">
                <DialogTitle>Редактировать счёт</DialogTitle>
                <DialogContent>
                    {editingAccount ? (
                        <AccountForm initialValues={{ name: editingAccount.name, type: editingAccount.type, currency: editingAccount.currency }} submitLabel="Сохранить" onSubmit={handleUpdateAccount} />
                    ) : null}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmDelete.open}
                title="Удалить?"
                description="Это действие нельзя отменить."
                onCancel={() => confirmDelete.handleClose(false)}
                onConfirm={() => confirmDelete.handleClose(true)}
            />
        </Stack>
    );
};
