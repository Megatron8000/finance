import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { AppBar, Box, Button, Container, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useThemeContext } from '../../context/ThemeContext';

export const AppLayout = () => {
    const { logout } = useAuth();
    const { mode, toggleTheme } = useThemeContext();

    return (
        <Box minHeight="100vh" bgcolor="background.default">
            <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Toolbar>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                        <Typography variant="h5" fontWeight={700}>Управление личными финансами</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <IconButton onClick={toggleTheme} color="inherit">
                                {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                            </IconButton>
                            <Button startIcon={<LogoutOutlinedIcon />} onClick={logout}>Выйти</Button>
                        </Stack>
                    </Stack>
                </Toolbar>
            </AppBar>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Outlet />
            </Container>
        </Box>
    );
};
