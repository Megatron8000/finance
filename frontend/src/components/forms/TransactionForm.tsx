import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { Account } from '../../types/account';
import type { Category } from '../../types/category';
import type { TransactionCreatePayload, TransactionType } from '../../types/transaction';
import { today } from '../../utils/date';

interface TransactionFormProps {
    accounts: Account[];
    categories: Category[];
    onSubmit: (payload: TransactionCreatePayload) => Promise<void>;
}

const transactionTypes: TransactionType[] = ['INCOME', 'EXPENSE'];

export const TransactionForm = ({ accounts, categories, onSubmit }: TransactionFormProps) => {
    // Инициализация формы транзакции с дефолтными значениями.
    const { control, watch, handleSubmit, reset, formState: { isSubmitting } } = useForm<TransactionCreatePayload>({
        defaultValues: {
            accountId: '',
            categoryId: '',
            type: 'EXPENSE',
            amount: 0,
            transactionDate: today(),
            comment: ''
        }
    });

    // Выбранный тип операции влияет на набор доступных категорий.
    const type = watch('type');
    const filteredCategories = categories.filter((category) => category.type === type);

    return (
        // Перед отправкой приводим сумму к числу и сбрасываем форму после успеха.
        <Stack component="form" spacing={2} onSubmit={handleSubmit(async (values) => {
            const comment = values.comment?.trim() || null;
            await onSubmit({ ...values, amount: Number(values.amount), comment });
            reset({ accountId: '', categoryId: '', type, amount: 0, transactionDate: today(), comment: '' });
        })}>
            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <TextField {...field} select label="Тип операции">
                        {transactionTypes.map((item) => (
                            <MenuItem key={item} value={item}>{item}</MenuItem>
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
                        {accounts.map((account) => (
                            <MenuItem key={account.id} value={account.id}>{account.name}</MenuItem>
                        ))}
                    </TextField>
                )}
            />
            <Controller
                name="categoryId"
                control={control}
                rules={{ required: 'Выберите категорию' }}
                render={({ field, fieldState }) => (
                    <TextField {...field} select label="Категория" error={!!fieldState.error} helperText={fieldState.error?.message}>
                        {filteredCategories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                        ))}
                    </TextField>
                )}
            />
            <Controller
                name="amount"
                control={control}
                rules={{ required: 'Введите сумму', min: { value: 0.01, message: 'Сумма должна быть больше 0' } }}
                render={({ field, fieldState }) => (
                    <TextField {...field} type="number" label="Сумма" error={!!fieldState.error} helperText={fieldState.error?.message} inputProps={{ step: 0.01 }} />
                )}
            />
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
