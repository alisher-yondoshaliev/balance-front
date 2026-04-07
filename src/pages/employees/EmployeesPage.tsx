import { useEffect, useState } from 'react';
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
import type { AxiosError } from 'axios';
import { usersApi } from '../../api/endpoints/users.api';
import { useMarketStore } from '../../store/market.store';
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

export default function EmployeesPage() {
    const { selectedMarket } = useMarketStore();
    const [employees, setEmployees] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
    const [dialogError, setDialogError] = useState('');
    const [dialogLoading, setDialogLoading] = useState(false);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
    });

    // Load market employees
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                // Check if market is selected FIRST
                if (!selectedMarket?.id) {
                    console.log('No market selected:', selectedMarket);
                    setError('Avval market tanlang');
                    setLoading(false);
                    setEmployees([]);
                    return;
                }
                
                // Only then start loading
                setLoading(true);
                setError(null);

                console.log('Fetching employees for market:', selectedMarket.id);
                const response = await usersApi.getUsers(selectedMarket.id);
                console.log('Employees response:', response);
                console.log('Response data:', response.data);
                const data = response.data.data || response.data || [];
                console.log('Parsed employees:', data);
                setEmployees(Array.isArray(data) ? data : []);
            } catch (err) {
                const error = err as AxiosError<{ message: string }> | Error;
                const message = error instanceof Error ? error.message : 'Xodimlarni yuklab olishda xatolik';
                console.error('Employees fetch error:', err);
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [selectedMarket?.id]);

    const handleOpenDialog = (employee: User | null = null) => {
        setEditingEmployee(employee);
        setDialogError('');
        if (employee) {
            const validRoles: string[] = ['ADMIN', 'MANAGER', 'SELLER'];
            const employeeRole = validRoles.includes(employee.role) ? employee.role : 'ADMIN';

            reset({
                fullName: employee.fullName,
                email: employee.email,
                phone: employee.phone,
                role: employeeRole as 'ADMIN' | 'MANAGER' | 'SELLER',
            });
        } else {
            reset({});
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingEmployee(null);
        setDialogError('');
        reset();
    };

    const onSubmit = async (data: EmployeeFormData) => {
        setDialogLoading(true);
        setDialogError('');
        try {
            if (editingEmployee) {
                await usersApi.updateUser(editingEmployee.id, data);
                setEmployees(employees.map(e => e.id === editingEmployee.id ? { ...e, ...data } : e));
            } else {
                if (!selectedMarket?.id) {
                    setDialogError('Market topilmadi');
                    setDialogLoading(false);
                    return;
                }

                await usersApi.createUser({
                    ...data,
                    marketId: selectedMarket.id,
                });

                const response = await usersApi.getUsers(selectedMarket.id);
                setEmployees(response.data.data || response.data || []);
            }
            handleCloseDialog();
        } catch (err) {
            const error = err as AxiosError<{ message: string }> | Error;
            const message = error instanceof Error ? error.message : 'Xatolik yuz berdi';
            setDialogError(message);
        } finally {
            setDialogLoading(false);
        }
    };

    const handleDeleteEmployee = async (id: string) => {
        if (!window.confirm('Haqiqatdan ham o\'chirilsinmi?')) return;

        try {
            await usersApi.deleteUser(id);
            setEmployees(employees.filter(e => e.id !== id));
        } catch (err) {
            const error = err as AxiosError<{ message: string }> | Error;
            const message = error instanceof Error ? error.message : 'O\'chirishda xatolik';
            setError(message);
        }
    };

    const getRoleLabel = (role: string): string => {
        const roleMap: Record<string, string> = {
            'ADMIN': 'Admin',
            'MANAGER': 'Menejer',
            'SELLER': 'Sotuvchi',
        };
        return roleMap[role] || role;
    };

    const getRoleColor = (role: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
        const colorMap: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
            'ADMIN': 'info',
            'MANAGER': 'success',
            'SELLER': 'warning',
        };
        return colorMap[role] || 'default';
    };

    const getStatusLabel = (status: string): string => {
        const statusMap: Record<string, string> = {
            'ACTIVE': 'Faol',
            'INACTIVE': 'Faol emas',
            'active': 'Faol',
            'inactive': 'Faol emas',
        };
        return statusMap[status] || status;
    };

    const getStatusColor = (status: string): 'success' | 'error' | 'default' => {
        const color = status?.toLowerCase();
        return color === 'active' ? 'success' : color === 'inactive' ? 'error' : 'default';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Page Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Xodimlar {selectedMarket && `- ${selectedMarket.name}`}
                </Typography>
                {selectedMarket && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Yangi Xodim
                    </Button>
                )}
            </Box>

            {/* Loading State */}
            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                    <CircularProgress />
                </Box>
            )}

            {/* Error Alert */}
            {!loading && error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Employees Table */}
            {!loading && !loading && selectedMarket && (
                <>
                    {employees.length === 0 ? (
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 5 }}>
                                <Typography color="text.secondary">
                                    Xodimlar yo'q
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
                                    {employees.map((employee) => (
                                        <TableRow key={employee.id} hover>
                                            <TableCell>{employee.fullName}</TableCell>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>{employee.phone || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getRoleLabel(employee.role)}
                                                    color={getRoleColor(employee.role)}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusLabel(employee.status || 'ACTIVE')}
                                                    color={getStatusColor(employee.status || 'ACTIVE')}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(employee)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteEmployee(employee.id)}
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
                </>
            )}

            {/* Dialog - Create/Edit Employee */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingEmployee ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}</DialogTitle>
                <DialogContent>
                    {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
                    <Box component="form" sx={{ mt: 2 }}>
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

                        {!editingEmployee && (
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
                                <FormControl fullWidth error={!!errors.role}>
                                    <InputLabel>Rol</InputLabel>
                                    <Select {...field} label="Rol">
                                        <MenuItem value="ADMIN">Admin</MenuItem>
                                        <MenuItem value="MANAGER">Menejer</MenuItem>
                                        <MenuItem value="SELLER">Sotuvchi</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Bekor qilish</Button>
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
