import { Box, CircularProgress } from '@mui/material';

// Универсальный индикатор загрузки для блоков интерфейса.
export const Loader = () => (
    // Центрируем спиннер по горизонтали и вертикали с минимальной высотой контейнера.
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
    </Box>
);
