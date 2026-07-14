import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { AccountCreatePayload, AccountType, Currency } from '../../types/account';
import { ACCOUNT_TYPE_LABELS, CURRENCY_META, CURRENCY_OPTIONS } from '../../types/account';
import { CurrencyFlag } from '../common/CurrencyFlag';

interface AccountFormProps {
    initialValues?: AccountCreatePayload;
    submitLabel?: string;
    onSubmit: (values: AccountCreatePayload) => Promise<void>;
}

const accountTypes: AccountType[] = ['CASH', 'NON_CASH', 'SAVINGS'];
const defaultValues: AccountCreatePayload = { name: '', type: 'NON_CASH', currency: 'RUB', interestRate: null };

export const AccountForm = ({ initialValues = defaultValues, submitLabel = 'Добавить счёт', onSubmit }: AccountFormProps) => {
    const { control, watch, handleSubmit, reset, formState: { isSubmitting } } = useForm<AccountCreatePayload>({
        defaultValues: initialValues
    });

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    const accountType = watch('type');

    return (
        <Stack component="form" spacing={2} onSubmit={handleSubmit(async (values) => {
            const payload = {
                ...values,
                interestRate: values.type === 'SAVINGS' && values.interestRate ? Number(values.interestRate) : null
            };
            await onSubmit(payload);
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
            <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                    <TextField {...field} select label="Валюта">
                        {CURRENCY_OPTIONS.map((cur: Currency) => (
                            <MenuItem key={cur} value={cur}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CurrencyFlag currency={cur} />
                                    <span>{CURRENCY_META[cur].label} ({CURRENCY_META[cur].symbol})</span>
                                </Stack>
                            </MenuItem>
                        ))}
                    </TextField>
                )}
            />
            {accountType === 'SAVINGS' && (
                <Controller
                    name="interestRate"
                    control={control}
                    rules={{ min: { value: 0, message: 'Ставка не может быть отрицательной' }, max: { value: 100, message: 'Ставка не может превышать 100%' } }}
                    render={({ field, fieldState }) => (
                        <TextField
                            {...field}
                            value={field.value ?? ''}
                            type="number"
                            label="Процентная ставка (% годовых)"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            inputProps={{ step: 0.1, min: 0, max: 100 }}
                        />
                    )}
                />
            )}
            <Button type="submit" variant="contained" disabled={isSubmitting}>{submitLabel}</Button>
        </Stack>
    );
};
