import { Alert, Snackbar } from '@mui/material';

// Пропсы компонента уведомления об ошибке.
interface ErrorSnackbarProps {
    open: boolean;
    message: string;
    onClose: () => void;
}

// Универсальный snackbar для показа текстов ошибок.
export const ErrorSnackbar = ({ open, message, onClose }: ErrorSnackbarProps) => (
    // Контейнер уведомления, автоматически скрывается через 4 секунды.
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {/* Визуальное оформление ошибки внутри snackbar. */}
        <Alert onClose={onClose} severity="error" variant="filled" sx={{ width: '100%' }}>
            {message}
        </Alert>
    </Snackbar>
);
