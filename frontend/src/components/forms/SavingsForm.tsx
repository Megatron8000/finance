import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { Account } from '../../types/account';

interface SavingsFormProps {
    accounts: Account[];
    onSubmit: (accountId: string) => Promise<void>;
}

interface SavingsValues {
    accountId: string;
}

export const SavingsForm = ({ accounts, onSubmit }: SavingsFormProps) => {
    // Форма выбора накопительного счёта для капитализации.
    const { control, handleSubmit, formState: { isSubmitting } } = useForm<SavingsValues>({
        defaultValues: { accountId: '' }
    });

    return (
        // Передаём выбранный счёт в обработчик отправки.
        <Stack component="form" spacing={2} onSubmit={handleSubmit(async ({ accountId }) => onSubmit(accountId))}>
            <Controller
                name="accountId"
                control={control}
                rules={{ required: 'Выберите накопительный счёт' }}
                render={({ field, fieldState }) => (
                    <TextField {...field} select label="Накопительный счёт" error={!!fieldState.error} helperText={fieldState.error?.message}>
                        {/* Список доступных накопительных счетов. */}
                        {accounts.map((account) => (
                            <MenuItem key={account.id} value={account.id}>{account.name}</MenuItem>
                        ))}
                    </TextField>
                )}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting}>Капитализировать</Button>
        </Stack>
    );
};
