import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usersApi } from '../../api/endpoints/users.api';
import { useAuthStore } from '../../store/auth.store';
import type { User } from '../../types';

// Employee Form Schema
const employeeSchema = z.object({
    fullName: z.string().min(3, 'Ism kamida 3 ta belgi'),
    email: z.string().email('Email noto\'g\'ri'),
    phone: z.string().min(10, 'Telefon raqami noto\'g\'ri').optional(),
    password: z.string().min(8, 'Parol kamida 8 ta belgi').optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'SELLER']),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function UsersPage() {
    const { marketId } = useParams<{ marketId?: string }>();
    const { user: authUser } = useAuthStore();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [dialogError, setDialogError] = useState('');
    const [dialogLoading, setDialogLoading] = useState(false);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
    });

    // Load market users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get users for market (marketId from route params)
                if (!marketId) {
                    setError('Market ID topilmadi');
                    setLoading(false);
                    return;
                }

                const response = await usersApi.getUsers(marketId);
                setUsers(response.data.data || response.data || []);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Users yuklab olishda xatolik');
                console.error('Users fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [marketId]);

    const handleOpenDialog = (user: User | null = null) => {
        setEditingUser(user);
        setDialogError('');
        if (user) {
            // Check if user has a valid market role
            const validRoles: string[] = ['ADMIN', 'MANAGER', 'SELLER'];
            const userRole = validRoles.includes(user.role) ? user.role : 'ADMIN';
            
            reset({
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: userRole as 'ADMIN' | 'MANAGER' | 'SELLER',
            });
        } else {
            reset({});
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setDialogError('');
        reset();
    };

    const onSubmit = async (data: EmployeeFormData) => {
        setDialogLoading(true);
        setDialogError('');
        try {
            if (editingUser) {
                // Update user
                await usersApi.updateUser(editingUser.id, data);
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
            } else {
                // Create new user for market
                if (!marketId) {
                    setDialogError('Market ID topilmadi');
                    setDialogLoading(false);
                    return;
                }

                await usersApi.createUser({
                    ...data,
                    marketId,
                });
                
                // Refresh users list
                const response = await usersApi.getUsers(marketId);
                setUsers(response.data.data || response.data || []);
            }
            handleCloseDialog();
        } catch (err: any) {
            setDialogError(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setDialogLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm('Haqiqatan ham o\'chirasizmi?')) {
            try {
                await usersApi.deleteUser(id);
                setUsers(users.filter(u => u.id !== id));
            } catch (err: any) {
                setError(err.response?.data?.message || 'Foydalanuvchini o\'chirishda xatolik');
                // Refresh list on error to sync with backend
                if (authUser?.marketId) {
                    const response = await usersApi.getUsers(authUser.marketId);
                    setUsers(response.data.data || response.data || []);
                }
            }
        }
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, 'error' | 'primary' | 'warning' | 'success' | 'info'> = {
            ADMIN: 'warning',
            MANAGER: 'info',
            SELLER: 'success',
        };
        return colors[role] || 'default';
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            ADMIN: 'Admin',
            MANAGER: 'Menejer',
            SELLER: 'Sotuvchi',
        };
        return labels[role] || role;
    };

    const getStatusColor = (status: string | undefined) => {
        const normalized = status?.toLowerCase() || 'active';
        return normalized === 'active' ? 'success' : 'warning';
    };

    const getStatusLabel = (status: string | undefined) => {
        const normalized = status?.toLowerCase() || 'active';
        return normalized === 'active' ? 'Faol' : 'Faol emas';
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                        Xodimlar
                    </Typography>
                    {authUser?.marketId && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Market: {authUser?.role}
                        </Typography>
                    )}
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
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

            {/* Users Table */}
            {users.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 5 }}>
                        <Typography color="text.secondary">
                            Ushbu marketda hech qanday xodim topilmadi
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Card}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Ism</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Telefon</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Holat</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Amallar</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phone || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getRoleLabel(user.role)}
                                            color={getRoleColor(user.role)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(user.status)}
                                            color={getStatusColor(user.status)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDialog(user)}
                                            color="primary"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteUser(user.id)}
                                            color="error"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* User Form Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? 'Xodimni Tahrirlash' : 'Yangi Xodim'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {dialogError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {dialogError}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Controller
                                name="fullName"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        label="To'liq Ism"
                                        {...field}
                                        error={!!errors.fullName}
                                        helperText={errors.fullName?.message}
                                        sx={{ mb: 2 }}
                                    />
                                )}
                            />

                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        type="email"
                                        {...field}
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                        sx={{ mb: 2 }}
                                        disabled={!!editingUser}
                                    />
                                )}
                            />

                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        fullWidth
                                        label="Telefon"
                                        type="tel"
                                        {...field}
                                        error={!!errors.phone}
                                        helperText={errors.phone?.message}
                                        sx={{ mb: 2 }}
                                        placeholder="+998901234567"
                                    />
                                )}
                            />

                            {!editingUser && (
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            label="Parol"
                                            type="password"
                                            {...field}
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                            sx={{ mb: 2 }}
                                            placeholder="Kamida 8 ta belgi"
                                        />
                                    )}
                                />
                            )}

                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.role}>
                                        <InputLabel>Rol</InputLabel>
                                        <Select {...field} label="Rol">
                                            <MenuItem value="ADMIN">Admin</MenuItem>
                                            <MenuItem value="MANAGER">Menejer</MenuItem>
                                            <MenuItem value="SELLER">Sotuvchi</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </form>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={dialogLoading}>
                        Bekor qilish
                    </Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        variant="contained"
                        disabled={dialogLoading}
                    >
                        {dialogLoading ? <CircularProgress size={24} /> : 'Saqlash'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}