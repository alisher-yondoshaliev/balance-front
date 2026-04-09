import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography,
} from '@mui/material';

interface ConfirmDeleteDialogProps {
    open: boolean;
    categoryName: string;
    isLoading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmDeleteDialog({
    open,
    categoryName,
    isLoading = false,
    onClose,
    onConfirm,
}: ConfirmDeleteDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>O'chirishni tasdiqlash</DialogTitle>
            <DialogContent>
                <Typography>
                    "{categoryName}" kategoriyasini o'chirishga rozimisiz? Bu amal qaytarib bo'lmaydi.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>
                    Bekor qilish
                </Button>
                <Button
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    disabled={isLoading}
                >
                    O'chirish
                </Button>
            </DialogActions>
        </Dialog>
    );
}
