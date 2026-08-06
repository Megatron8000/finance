import AddCardOutlinedIcon from '@mui/icons-material/AddCardOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { BalanceChart } from '../components/charts/BalanceChart';
import { AccountFilter } from '../components/common/AccountFilter';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Loader } from '../components/common/Loader';
import { AccountForm } from '../components/forms/AccountForm';
import { useConfirm } from '../hooks/useConfirm';
import { useAccountStore } from '../store/accountStore';
import type { Account, AccountCreatePayload, Currency } from '../types/account';
import { ACCOUNT_TYPE_LABELS, CURRENCY_META } from '../types/account';
import { CurrencyFlag } from '../components/common/CurrencyFlag';
import { formatMoney, toNumber } from '../utils/money';

const FALLBACK_RATES_TO_RUB: Record<Currency, number> = {
    RUB: 1,
    USD: 90.00,
    CNY: 12.50,
    BYN: 28.00,
    AED: 24.50,
};

function computeTotalBalanceRUB(accounts: Account[]): number {
    return accounts.reduce((sum, a) => sum + toNumber(a.balance) * FALLBACK_RATES_TO_RUB[a.currency], 0);
}

export const DashboardPage = () => {
    const { accounts, fetchAccounts, createAccount, updateAccount, deleteAccount, isLoading, error } = useAccountStore();
    const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
    const confirmDelete = useConfirm();

    useEffect(() => {
        void fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        if (accounts.length > 0 && selectedAccountIds.length === 0) {
            setSelectedAccountIds(accounts.map((a) => a.id));
        }
    }, [accounts, selectedAccountIds.length]);

    const filteredAccounts = useMemo(
        () => accounts.filter((a) => selectedAccountIds.includes(a.id)),
        [accounts, selectedAccountIds]
    );

    const totalBalance = useMemo(() => computeTotalBalanceRUB(filteredAccounts), [filteredAccounts]);

    const savingsCount = useMemo(
        () => filteredAccounts.filter((account) => account.type === 'SAVINGS').length,
        [filteredAccounts]
    );

    const handleCreateAccount = async (payload: AccountCreatePayload) => {
        await createAccount(payload);
    };

    const handleUpdateAccount = async (payload: AccountCreatePayload) => {
        if (!editingAccount) {
            return;
        }

        await updateAccount(editingAccount.id, payload);
        setEditingAccount(null);
    };

    const handleDeleteAccount = async (account: Account) => {
        setDeletingAccount(account);
        const accepted = await confirmDelete.confirm();

        if (!accepted) {
            setDeletingAccount(null);
            return;
        }

        await deleteAccount(account.id);
        setDeletingAccount(null);
    };

    const handleAccountFilterChange = (ids: string[]) => {
        setSelectedAccountIds(ids);
    };

    if (isLoading && accounts.length === 0) {
        return <Loader />;
    }

    return (
        <Stack spacing={3}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight={700}>Управление личными финансами</Typography>
                {accounts.length > 0 && (
                    <AccountFilter
                        accounts={accounts}
                        selectedIds={selectedAccountIds}
                        onChange={handleAccountFilterChange}
                    />
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>Общий баланс (₽)</Typography>
                            <Typography variant="h4" fontWeight={700}>{formatMoney(totalBalance)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>Количество счетов</Typography>
                            <Typography variant="h4" fontWeight={700}>{filteredAccounts.length}</Typography>
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
                    <BalanceChart accounts={filteredAccounts} />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card>
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <AddCardOutlinedIcon color="primary" />
                                    <Typography variant="h6">Добавить счёт</Typography>
                                </Stack>
                                <AccountForm onSubmit={handleCreateAccount} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <Typography variant="h6">Список счетов</Typography>
                        <Stack spacing={1.5}>
                            {accounts.map((account) => {
                                const curMeta = CURRENCY_META[account.currency];
                                return (
                                    <Box
                                        key={account.id}
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr auto', sm: '1fr auto auto' },
                                            gap: 1,
                                            alignItems: 'center',
                                            border: 1,
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            px: 2,
                                            py: 1.25
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <CurrencyFlag currency={account.currency} />
                                                <Typography fontWeight={600} noWrap>{account.name}</Typography>
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">
                                                {ACCOUNT_TYPE_LABELS[account.type]} · {curMeta.symbol}
                                            </Typography>
                                        </Box>
                                        <Typography fontWeight={700} sx={{ whiteSpace: 'nowrap' }}>
                                            {formatMoney(toNumber(account.balance), account.currency)}
                                        </Typography>
                                        <Stack direction="row" spacing={0.5} sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' }, justifySelf: { xs: 'end', sm: 'auto' } }}>
                                            <Tooltip title="Редактировать">
                                                <IconButton aria-label="Редактировать счёт" onClick={() => setEditingAccount(account)}>
                                                    <EditOutlinedIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Удалить">
                                                <IconButton aria-label="Удалить счёт" color="error" onClick={() => void handleDeleteAccount(account)}>
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Dialog open={!!editingAccount} onClose={() => setEditingAccount(null)} fullWidth maxWidth="sm">
                <DialogTitle>Редактировать счёт</DialogTitle>
                <DialogContent>
                    {editingAccount ? (
                        <AccountForm
                            initialValues={{ name: editingAccount.name, type: editingAccount.type, currency: editingAccount.currency }}
                            submitLabel="Сохранить"
                            onSubmit={handleUpdateAccount}
                        />
                    ) : null}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmDelete.open}
                title="Удалить счёт?"
                description={`Счёт "${deletingAccount?.name ?? ''}" и связанные с ним транзакции будут удалены.`}
                onCancel={() => confirmDelete.handleClose(false)}
                onConfirm={() => confirmDelete.handleClose(true)}
            />
        </Stack>
    );
};
