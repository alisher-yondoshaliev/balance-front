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
    CheckCircle as CheckCircleIcon,
    Edit as EditIcon,
    ToggleOff as ToggleOffIcon,
    ToggleOn as ToggleOnIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/auth.store';
import { useMarketStore } from '../../store/market.store';
import { extractApiErrorMessage } from '../../api/error';
import { usersApi } from '../../api/endpoints/users.api';
import type { User, Role } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

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
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusTargetUser, setStatusTargetUser] = useState<User | null>(null);
    const [statusSubmitting, setStatusSubmitting] = useState(false);
    const [statusError, setStatusError] = useState('');
    const [statusValue, setStatusValue] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

    const { handleSubmit, reset, setValue, watch } = useForm<CreateUserInput>({
        defaultValues: { role: 'SELLER' },
    });

    const formValues = watch();

    const isUserActive = (status?: string) => status?.toUpperCase() === 'ACTIVE';

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
                await fetchUsers();
            } else {
                // Create new user
                console.log('[Employee Create] Sending POST /api/users with payload:', payload);
                const response = await usersApi.createUser(payload);
                const createdUser = response.data as User | undefined;

                if (createdUser?.id) {
                    setUsers((prev) => {
                        const next = prev.filter((item) => item.id !== createdUser.id);
                        return [createdUser, ...next];
                    });
                }

                await fetchUsers();
            }
            handleCloseDialog();
        } catch (err) {
            const message = extractApiErrorMessage(err, 'Xatolik yuz berdi');
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

    const handleOpenStatusDialog = (user: User) => {
        setStatusTargetUser(user);
        setStatusValue(isUserActive(user.status) ? 'INACTIVE' : 'ACTIVE');
        setStatusError('');
        setStatusDialogOpen(true);
    };

    const handleCloseStatusDialog = () => {
        if (statusSubmitting) {
            return;
        }

        setStatusDialogOpen(false);
        setStatusTargetUser(null);
        setStatusError('');
        setStatusValue('ACTIVE');
    };

    const handleSubmitStatusChange = async () => {
        if (!statusTargetUser) {
            return;
        }

        try {
            setStatusSubmitting(true);
            setStatusError('');
            await usersApi.updateUserStatus(statusTargetUser.id, statusValue);
            await fetchUsers();
            handleCloseStatusDialog();
        } catch (err) {
            setStatusError(extractApiErrorMessage(err, 'Statusni yangilab bo‘lmadi'));
        } finally {
            setStatusSubmitting(false);
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
            <PageHeader
                eyebrow="Users"
                title="Barcha Xodimlar"
                subtitle={
                    currentUser?.role === 'OWNER' && selectedMarket?.id
                        ? `Market: ${selectedMarket.name}`
                        : "Tizim foydalanuvchilari va ularning statuslarini boshqaring."
                }
                action={(
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
                )}
            />

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <DataTable
                title="Xodimlar ro'yxati"
                subtitle="Ism, email yoki telefon bo'yicha qidiruv."
                toolbar={(
                    <TextField
                        fullWidth
                        placeholder="Ism, email yoki telefon bo'yicha qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                        }}
                    />
                )}
            >
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
                                            label={isUserActive(user.status) ? 'Faol' : 'Faol emas'}
                                            size="small"
                                            color={isUserActive(user.status) ? 'success' : 'error'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            color={isUserActive(user.status) ? 'warning' : 'success'}
                                            onClick={() => handleOpenStatusDialog(user)}
                                            title={isUserActive(user.status) ? 'Nofaol qilish' : 'Faol qilish'}
                                        >
                                            {isUserActive(user.status) ? (
                                                <ToggleOffIcon fontSize="small" />
                                            ) : (
                                                <ToggleOnIcon fontSize="small" />
                                            )}
                                        </IconButton>
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
            </DataTable>

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

            <Dialog
                open={statusDialogOpen}
                onClose={handleCloseStatusDialog}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Statusni o'zgartirish</DialogTitle>
                <DialogContent>
                    {statusError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {statusError}
                        </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {statusTargetUser?.fullName} uchun yangi statusni tanlang.
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusValue}
                            label="Status"
                            onChange={(e) => setStatusValue(e.target.value as 'ACTIVE' | 'INACTIVE')}
                        >
                            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStatusDialog} disabled={statusSubmitting}>
                        Bekor qilish
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmitStatusChange}
                        disabled={statusSubmitting || !statusTargetUser}
                        startIcon={
                            statusSubmitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />
                        }
                    >
                        Saqlash
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
