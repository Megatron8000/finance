import { createTheme } from '@mui/material/styles';

// Базовая тема MUI для светлого интерфейса приложения.
export const muiTheme = createTheme({
    // Цветовая палитра приложения.
    palette: {
        mode: 'light',
        // Основной акцентный цвет.
        primary: {
            main: '#1565c0'
        },
        // Дополнительный акцентный цвет.
        secondary: {
            main: '#00897b'
        },
        // Цвета фона для страницы и поверхностей.
        background: {
            default: '#f4f7fb',
            paper: '#ffffff'
        }
    },
    // Глобальный радиус скругления компонентов.
    shape: {
        borderRadius: 16
    },
    // Точечные стили отдельных компонентов MUI.
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    // Мягкая тень для визуального отделения карточек от фона.
                    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)'
                }
            }
        }
    }
});
