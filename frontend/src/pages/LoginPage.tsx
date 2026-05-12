import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Avatar, Box, Button, Card, CardContent, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AuthFormValues {
    email: string;
    password: string;
}

export const LoginPage = () => {
    // 0 — вход, 1 — регистрация
    const [tab, setTab] = useState(0);
    const { login, register, isAuthenticated, isLoading, error } = useAuth();
    // Инициализация и контроль формы через react-hook-form
    const { control, handleSubmit } = useForm<AuthFormValues>({
        defaultValues: { email: '', password: '' }
    });

    // Если пользователь уже вошел, сразу перенаправляем на главную
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Отправка формы: выбор действия зависит от активной вкладки
    const submit = async (values: AuthFormValues) => {
        if (tab === 0) {
            await login(values);
            return;
        }

        await register(values);
    };

    return (
        <Box minHeight="100vh" display="grid" sx={{ placeItems: 'center', bgcolor: '#e8f0fe', px: 2 }}>
            <Card sx={{ width: '100%', maxWidth: 460 }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                        <Stack alignItems="center" spacing={1}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}><LockOutlinedIcon /></Avatar>
                            <Typography variant="h5" fontWeight={700}>Finance Frontend</Typography>
                            <Typography color="text.secondary">Войдите или зарегистрируйтесь для работы с API.</Typography>
                        </Stack>

                        {/* Переключение между входом и регистрацией */}
                        <Tabs value={tab} onChange={(_: SyntheticEvent, value: number) => setTab(value)} variant="fullWidth">
                            <Tab label="Вход" />
                            <Tab label="Регистрация" />
                        </Tabs>

                        {error ? <Alert severity="error">{error}</Alert> : null}

                        {/* Форма с валидацией email и пароля */}
                        <Stack component="form" spacing={2} onSubmit={handleSubmit(submit)}>
                            <Controller
                                name="email"
                                control={control}
                                rules={{ required: 'Введите email' }}
                                render={({ field, fieldState }) => (
                                    <TextField {...field} label="Email" type="email" error={!!fieldState.error} helperText={fieldState.error?.message} />
                                )}
                            />
                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: 'Введите пароль', minLength: { value: tab === 0 ? 6 : 8, message: 'Слишком короткий пароль' } }}
                                render={({ field, fieldState }) => (
                                    <TextField {...field} label="Пароль" type="password" error={!!fieldState.error} helperText={fieldState.error?.message} />
                                )}
                            />
                            <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                                {tab === 0 ? 'Войти' : 'Создать аккаунт'}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};
