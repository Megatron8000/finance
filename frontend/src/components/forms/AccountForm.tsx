import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { AccountCreatePayload, AccountType } from '../../types/account';

interface AccountFormProps {
    onSubmit: (values: AccountCreatePayload) => Promise<void>;
}

// Доступные типы счёта для выбора в форме.
const accountTypes: AccountType[] = ['CASH', 'NON_CASH', 'SAVINGS'];

export const AccountForm = ({ onSubmit }: AccountFormProps) => {
    // Инициализация формы и значений по умолчанию.
    const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<AccountCreatePayload>({
        defaultValues: { name: '', type: 'NON_CASH' }
    });

    return (
        // После успешной отправки очищаем форму.
        <Stack component="form" spacing={2} onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
            reset();
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
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </TextField>
                )}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting}>Добавить счёт</Button>
        </Stack>
    );
};
