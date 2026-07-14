import { Alert, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { categoryApi } from '../../api/categoryApi';
import type { Account } from '../../types/account';
import { CURRENCY_META } from '../../types/account';
import { CurrencyFlag } from '../common/CurrencyFlag';
import type { Category, CategoryType } from '../../types/category';
import type { TransactionCreatePayload, TransactionType } from '../../types/transaction';
import { today } from '../../utils/date';

interface TransactionFormProps {
    accounts: Account[];
    categories: Category[];
    onCategoryCreated: (category: Category) => void;
    onSubmit: (payload: TransactionCreatePayload) => Promise<void>;
}

const transactionTypes: TransactionType[] = ['INCOME', 'EXPENSE'];

export const TransactionForm = ({ accounts, categories, onCategoryCreated, onSubmit }: TransactionFormProps) => {
    const { control, watch, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<TransactionCreatePayload>({
        defaultValues: {
            accountId: '',
            categoryId: '',
            type: 'EXPENSE',
            amount: 0,
            transactionDate: today(),
            comment: '',
            amountInRub: null
        }
    });

    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState<string | null>(null);

    const type = watch('type');
    const accountId = watch('accountId');
    const filteredCategories = categories.filter((category) => category.type === type);

    const selectedAccount = accounts.find((a) => a.id === accountId);
    const isForeignCurrency = selectedAccount && selectedAccount.currency !== 'RUB';
    const showConversion = isForeignCurrency && type === 'INCOME';
    const currencyInfo = selectedAccount ? CURRENCY_META[selectedAccount.currency] : null;

    const handleCreateCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) return;

        setIsCreatingCategory(true);
        setCategoryError(null);
        try {
            const category = await categoryApi.create({ name, type: type as CategoryType });
            onCategoryCreated(category);
            setValue('categoryId', category.id);
            setNewCategoryName('');
            setShowNewCategory(false);
        } catch (err) {
            setCategoryError(err instanceof Error ? err.message : 'Не удалось создать категорию');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    return (
        <Stack component="form" spacing={2} onSubmit={handleSubmit(async (values) => {
            const comment = values.comment?.trim() || null;
            const amountInRub = showConversion && values.amountInRub ? Number(values.amountInRub) : null;
            await onSubmit({ ...values, amount: Number(values.amount), comment, amountInRub });
            reset({ accountId: '', categoryId: '', type, amount: 0, transactionDate: today(), comment: '', amountInRub: null });
        })}>
            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <TextField {...field} select label="Тип операции">
                        {transactionTypes.map((item) => (
                            <MenuItem key={item} value={item}>{item === 'INCOME' ? 'Пополнение' : 'Расход'}</MenuItem>
                        ))}
                    </TextField>
                )}
            />
            <Controller
                name="accountId"
                control={control}
                rules={{ required: 'Выберите счёт' }}
                render={({ field, fieldState }) => (
                    <TextField {...field} select label="Счёт" error={!!fieldState.error} helperText={fieldState.error?.message}>
                        {accounts.map((account) => {
                            const meta = CURRENCY_META[account.currency];
                            return (
                                <MenuItem key={account.id} value={account.id}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CurrencyFlag currency={account.currency} />
                                        <span>{account.name} ({meta.symbol})</span>
                                    </Stack>
                                </MenuItem>
                            );
                        })}
                    </TextField>
                )}
            />
            {selectedAccount && (
                <Alert severity="info" sx={{ py: 0 }}>
                    Валюта счёта: {currencyInfo?.flag} {currencyInfo?.label}
                </Alert>
            )}
            <Controller
                name="categoryId"
                control={control}
                rules={{ required: 'Выберите категорию' }}
                render={({ field, fieldState }) => (
                    <TextField {...field} select label="Категория" error={!!fieldState.error} helperText={fieldState.error?.message}>
                        {filteredCategories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.system ? '📌 ' : ''}{category.name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
            />

            {!showNewCategory ? (
                <Chip
                    icon={<AddIcon />}
                    label="Добавить свою категорию"
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowNewCategory(true)}
                    sx={{ alignSelf: 'flex-start', cursor: 'pointer' }}
                />
            ) : (
                <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                        Новая категория «{type === 'INCOME' ? 'Доход' : 'Расход'}»
                    </Typography>
                    <TextField
                        size="small"
                        label="Название категории"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleCreateCategory(); } }}
                        error={!!categoryError}
                        helperText={categoryError}
                        autoFocus
                    />
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="contained"
                            disabled={!newCategoryName.trim() || isCreatingCategory}
                            onClick={() => void handleCreateCategory()}
                        >
                            {isCreatingCategory ? 'Создание...' : 'Создать'}
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            onClick={() => { setShowNewCategory(false); setNewCategoryName(''); setCategoryError(null); }}
                        >
                            Отмена
                        </Button>
                    </Stack>
                </Stack>
            )}

            {showConversion && (
                <Controller
                    name="amountInRub"
                    control={control}
                    rules={{ required: 'Введите сумму в рублях', min: { value: 0.01, message: 'Сумма должна быть больше 0' } }}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            value={field.value ?? ''}
                            type="number"
                            label="Сумма пополнения в ₽ (RUB)"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            inputProps={{ step: 0.01 }}
                        />
                    )}
                />
            )}
            <Controller
                name="amount"
                control={control}
                rules={{ required: 'Введите сумму', min: { value: 0.01, message: 'Сумма должна быть больше 0' } }}
                render={({ field, fieldState }) => (
                    <TextField
                        {...field}
                        type="number"
                        label={showConversion ? `Сумма в ${currencyInfo?.symbol}` : 'Сумма'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        inputProps={{ step: 0.01 }}
                        slotProps={{ input: { readOnly: showConversion } }}
                    />
                )}
            />
            {showConversion && (
                <Typography variant="body2" color="text.secondary">
                    Сумма в валюте счёта рассчитывается автоматически по курсу ЦБ РФ
                </Typography>
            )}
            <Controller
                name="transactionDate"
                control={control}
                render={({ field }) => <TextField {...field} type="date" label="Дата" InputLabelProps={{ shrink: true }} />}
            />
            <Controller
                name="comment"
                control={control}
                rules={{ maxLength: { value: 500, message: 'Комментарий не должен превышать 500 символов' } }}
                render={({ field, fieldState }) => (
                    <TextField
                        {...field}
                        value={field.value ?? ''}
                        label="Комментарий"
                        multiline
                        minRows={2}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                    />
                )}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting}>Сохранить транзакцию</Button>
        </Stack>
    );
};
