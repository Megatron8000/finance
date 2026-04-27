import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

// Пункты бокового меню: подпись, маршрут и иконка.
const items = [
    { label: 'Dashboard', to: '/', icon: <AccountBalanceWalletOutlinedIcon /> },
    { label: 'Транзакции', to: '/transactions', icon: <SwapHorizOutlinedIcon /> },
    { label: 'Аналитика', to: '/analytics', icon: <AnalyticsOutlinedIcon /> },
    { label: 'Накопления', to: '/savings', icon: <SavingsOutlinedIcon /> }
];

export const Sidebar = () => (
    // Основной контейнер сайдбара с фиксированной шириной и тёмным фоном.
    <Box sx={{ width: 280, bgcolor: '#0f172a', color: 'white', minHeight: '100vh' }}>
        <Toolbar>
            <Typography variant="h6" fontWeight={700}>Finance Console</Typography>
        </Toolbar>
        <List>
            {/* Рендерим элементы навигации из массива items. */}
            {items.map((item) => (
                <ListItemButton
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    sx={{
                        color: 'inherit',
                        mx: 1,
                        borderRadius: 2,
                        '&.active': { bgcolor: 'rgba(255,255,255,0.12)' }
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                </ListItemButton>
            ))}
        </List>
    </Box>
);
