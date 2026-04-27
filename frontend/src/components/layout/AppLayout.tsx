import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

export const AppLayout = () => {
    // Берем из контекста авторизации функцию выхода из аккаунта.
    const { logout } = useAuth();

    return (
        // Основной каркас страницы: боковая панель + контентная область.
        <Box display="flex" minHeight="100vh" bgcolor="background.default">
            <Sidebar />
            <Box flex={1}>
                {/* Верхняя панель приложения с заголовком и кнопкой выхода. */}
                <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0' }}>
                    <Toolbar>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                            <Typography variant="h5" fontWeight={700}>Управление личными финансами</Typography>
                            <Button startIcon={<LogoutOutlinedIcon />} onClick={logout}>Выйти</Button>
                        </Stack>
                    </Toolbar>
                </AppBar>
                <Container maxWidth="xl" sx={{ py: 4 }}>
                    {/* Сюда подставляется контент текущего маршрута. */}
                    <Outlet />
                </Container>
            </Box>
        </Box>
    );
};
