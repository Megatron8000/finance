import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export const ConfirmDialog = ({ open, title, description, onCancel, onConfirm }: ConfirmDialogProps) => (
    <Dialog open={open} onClose={onCancel}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>{description}</DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel}>Отмена</Button>
            <Button variant="contained" color="error" onClick={onConfirm}>
                Подтвердить
            </Button>
        </DialogActions>
    </Dialog>
);