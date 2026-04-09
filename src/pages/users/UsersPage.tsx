import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    InputAdornment,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/auth.store';
import { useMarketStore } from '../../store/market.store';
import { usersApi } from '../../api/endpoints/users.api';
import type { User, Role } from '../../types';

interface CreateUserInput {
    fullName: string;
    email: string;
    phone?: string;
    password?: string;
    role: string;
    marketId?: string;
}

/**
 * UsersPage - Owner/Admin xodimlarni boshqarish
 * GET /api/users endpoint orqali barcha xodimlarni oladi
 * Owner faqat ADMIN, MANAGER, SELLER rollarni qo'sha oladi
 */
export default function UsersPage() {
    const { user: currentUser } = useAuthStore();
    const { selectedMarket } = useMarketStore();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [search, setSearch] = useState('');
    const [dialogError, setDialogError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { handleSubmit, reset, setValue, watch } = useForm<CreateUserInput>({
        defaultValues: { role: 'SELLER' },
    });

    const formValues = watch();

    // Determine available roles based on current user role
    const getAvailableRoles = (): Role[] => {
        if (currentUser?.role === 'OWNER') {
            return ['ADMIN', 'MANAGER', 'SELLER'];
        }
        // ADMIN can create all roles except SUPERADMIN and OWNER
        return ['ADMIN', 'MANAGER', 'SELLER'];
    };

    const availableRoles = getAvailableRoles();

    // Fetch users when selectedMarket changes
    useEffect(() => {
        // For OWNER: must select market first
        if (currentUser?.role === 'OWNER' && !selectedMarket?.id) {
            setUsers([]);
            setError('Avval market tanlang');
            setLoading(false);
            return;
        }

        setError(null);
        fetchUsers();
    }, [selectedMarket?.id, currentUser?.role]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;

            if (currentUser?.role === 'OWNER' && selectedMarket?.id) {
                // For OWNER: fetch market-specific employees
                console.log('[Employees] Fetching market employees:', selectedMarket.id);
                response = await usersApi.getUsers(selectedMarket.id);
                console.log('[Employees] Market employees response:', response.data);
            } else if (currentUser?.role === 'OWNER') {
                // OWNER without market selected - should not reach here due to useEffect guard
                setError('Avval market tanlang');
                setLoading(false);
                return;
            } else {
                // For other roles (ADMIN, etc): fetch all users
                console.log('[Employees] Fetching all employees');
                response = await usersApi.getUsers();
                console.log('[Employees] All employees response:', response.data);
            }

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.data || [];

            setUsers(data);
            console.log('[Employees] Employees set to state:', data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Xodimlarni yuklab olishda xatolik';
            setError(message);
            console.error('[Employees] Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: CreateUserInput) => {
        setSubmitting(true);
        setDialogError('');

        try {
            // Validate market selection for OWNER role
            if (currentUser?.role === 'OWNER' && !selectedMarket?.id) {
                setDialogError('Avval market tanlang');
                setSubmitting(false);
                return;
            }

            const payload: any = {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                role: data.role,
            };

            // Add password only for new user creation
            if (!editingUser && data.password) {
                payload.password = data.password;
            }

            // Add marketId for OWNER - must use selectedMarket.id from store
            if (currentUser?.role === 'OWNER' && selectedMarket?.id) {
                payload.marketId = selectedMarket.id;
            }

            // Debug: Log payload before sending to backend
            console.log('[Employee Create] Payload being sent to backend:', payload);
            console.log('[Employee Create] Selected Market:', selectedMarket);

            if (editingUser) {
                // Update user - don't send password
                delete payload.password;
                console.log('[Employee Update] Payload:', payload);
                await usersApi.updateUser(editingUser.id, payload);
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...payload } : u) as User[]);
            } else {
                // Create new user
                console.log('[Employee Create] Sending POST /api/users with payload:', payload);
                await usersApi.createUser(payload);
                await fetchUsers();
            }
            handleCloseDialog();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Xatolik yuz berdi';
            setDialogError(message);
            console.error('Create/Update employee error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setValue('fullName', user.fullName);
        setValue('email', user.email);
        setValue('phone', user.phone || '');
        setValue('role', user.role);
        setOpenDialog(true);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('Haqiqatdan ham o\'chirilsinmi?')) return;

        try {
            await usersApi.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'O\'chirishda xatolik';
            setError(message);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setDialogError('');
        reset();
    };

    const filtered = users.filter((user) =>
        user.fullName.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.phone?.includes(search) ?? false),
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header with Market Info */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Barcha Xodimlar
                    </Typography>
                    {currentUser?.role === 'OWNER' && selectedMarket?.id && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Market: <strong>{selectedMarket.name}</strong>
                        </Typography>
                    )}
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    disabled={currentUser?.role === 'OWNER' && !selectedMarket?.id}
                    title={
                        currentUser?.role === 'OWNER' && !selectedMarket?.id
                            ? 'Avval market tanlang'
                            : ''
                    }
                >
                    Yangi Xodim
                </Button>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Search */}
            <TextField
                fullWidth
                placeholder="Ism, email yoki telefon bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                sx={{ mb: 2 }}
            />

            {/* Table */}
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Ism</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Telefon</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Amallar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length > 0 ? (
                            filtered.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role}
                                            size="small"
                                            variant="outlined"
                                            color={
                                                user.role === 'ADMIN'
                                                    ? 'info'
                                                    : user.role === 'MANAGER'
                                                        ? 'success'
                                                        : user.role === 'SELLER'
                                                            ? 'warning'
                                                            : user.role === 'SUPERADMIN'
                                                                ? 'error'
                                                                : 'default'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.status === 'active' ? 'Faol' : 'Faol emas'}
                                            size="small"
                                            color={user.status === 'active' ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditUser(user)}
                                            title="Tahrirlash"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteUser(user.id)}
                                            title="O'chirish"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">
                                        {search ? 'Natija topilmadi' : 'Xodimlar yo\'q'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? 'Xodimni tahrirlash' : 'Yangi Xodim'}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {/* Market Selection Info for OWNER */}
                        {currentUser?.role === 'OWNER' && !editingUser && (
                            <Alert severity={selectedMarket?.id ? 'success' : 'warning'} sx={{ mb: 2 }}>
                                {selectedMarket?.id
                                    ? `Market: ${selectedMarket.name}`
                                    : 'Avval market tanlang!'}
                            </Alert>
                        )}

                        {dialogError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {dialogError}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="To'liq ismni"
                            value={formValues.fullName || ''}
                            onChange={(e) => setValue('fullName', e.target.value)}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formValues.email || ''}
                            onChange={(e) => setValue('email', e.target.value)}
                            margin="normal"
                            required
                        />

                        <TextField
                            fullWidth
                            label="Telefon"
                            value={formValues.phone || ''}
                            onChange={(e) => setValue('phone', e.target.value)}
                            margin="normal"
                        />

                        {!editingUser && (
                            <TextField
                                fullWidth
                                label="Parol"
                                type="password"
                                value={formValues.password || ''}
                                onChange={(e) => setValue('password', e.target.value)}
                                margin="normal"
                                required
                            />
                        )}

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Rol</InputLabel>
                            <Select
                                value={formValues.role || 'SELLER'}
                                label="Rol"
                                onChange={(e) => setValue('role', e.target.value)}
                            >
                                {availableRoles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {role === 'ADMIN' && 'Admin'}
                                        {role === 'MANAGER' && 'Menejer'}
                                        {role === 'SELLER' && 'Sotuvchi'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Bekor qilish</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                submitting ||
                                (!editingUser && currentUser?.role === 'OWNER' && !selectedMarket?.id)
                            }
                            title={
                                !editingUser && currentUser?.role === 'OWNER' && !selectedMarket?.id
                                    ? 'Avval market tanlang'
                                    : ''
                            }
                        >
                            {submitting ? <CircularProgress size={24} /> : editingUser ? 'Saqlash' : 'Qo\'shish'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
