import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { AccountCreatePayload, AccountType } from '../../types/account';
import { ACCOUNT_TYPE_LABELS } from '../../types/account';

interface AccountFormProps {
    initialValues?: AccountCreatePayload;
    submitLabel?: string;
    onSubmit: (values: AccountCreatePayload) => Promise<void>;
}

const accountTypes: AccountType[] = ['CASH', 'NON_CASH', 'SAVINGS'];
const defaultValues: AccountCreatePayload = { name: '', type: 'NON_CASH' };

export const AccountForm = ({ initialValues = defaultValues, submitLabel = 'Добавить счёт', onSubmit }: AccountFormProps) => {
    const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<AccountCreatePayload>({
        defaultValues: initialValues
    });

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    return (
        <Stack component="form" spacing={2} onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
            reset(initialValues === defaultValues ? defaultValues : values);
        })}>
            <Controller
                name="name"
                control={control}
                rules={{ required: 'Введите название счёта' }}
                render={({ field, fieldState }) => (
                    <TextField {...field} label="Название счёта" error={!!fieldState.error} helperText={fieldState.error?.message} />
                )}
            />
            <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <TextField {...field} select label="Тип счёта">
                        {accountTypes.map((type) => (
                            <MenuItem key={type} value={type}>{ACCOUNT_TYPE_LABELS[type]}</MenuItem>
                        ))}
                    </TextField>
                )}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting}>{submitLabel}</Button>
        </Stack>
    );
};
