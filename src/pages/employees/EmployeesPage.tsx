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
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TablePagination,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/auth.store';
import { useMarketStore } from '../../store/market.store';
import { employeesApi, type CreateEmployeePayload } from '../../api/endpoints/employees.api';
import { EMPLOYEE_FILTER_OPTIONS, getStatusLabel, getRoleLabel } from '../../config/employeeFilters';
import type { MarketUser, MarketUsersResponse, MarketUsersQueryParams } from '../../types/resources';

/**
 * Helper: Build backend API query parameters
 * - Converts UI filter state to backend values
 * - Only includes non-empty optional filters
 * - Pages are 1-indexed for backend
 */
const buildQueryParams = (
    filters: EmployeeFilters,
    page: number,
    limit: number
): MarketUsersQueryParams => {
    const params: MarketUsersQueryParams = {
        page: page + 1, // Backend expects 1-indexed pages (0 -> 1, 1 -> 2, etc)
        limit,
        sortBy: filters.sortBy, // Already stored as backend value (fullName, createdAt)
        order: filters.order, // Already stored as backend value (asc, desc)
    };

    // Add optional filters only if they have non-empty values
    if (filters.search?.trim()) {
        params.search = filters.search.trim();
    }
    if (filters.status) {
        params.status = filters.status as 'active' | 'inactive';
    }
    if (filters.role) {
        // Role is already stored as backend value (ADMIN, MANAGER, SELLER)
        params.role = filters.role;
    }

    return params;
};

interface EmployeeFilters {
    search: string;
    status: 'active' | 'inactive' | '';
    role: string; // Stored as backend values: ADMIN, MANAGER, SELLER, or ''
    sortBy: 'fullName' | 'email' | 'createdAt';
    order: 'asc' | 'desc';
}

/**
 * EmployeesPage - Tanlangan marketga tegishli xodimlarni ko'rsatish
 * Endpoint: GET /api/markets/:marketId/users
 * 
 * This page demonstrates proper API integration:
 * 1. Converts UI filter labels to backend values
 * 2. Sends correct query parameters
 * 3. Handles market selection requirement
 * 4. Shows loading, error, and empty states
 */
export default function EmployeesPage() {
    const { user: currentUser } = useAuthStore();
    const { selectedMarket } = useMarketStore();

    // State
    const [employees, setEmployees] = useState<MarketUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Create/Edit Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<MarketUser | null>(null);
    const [dialogError, setDialogError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Pagination
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters state - stores backend values
    const [filters, setFilters] = useState<EmployeeFilters>({
        search: '',
        status: '',
        role: '',
        sortBy: 'fullName', // Backend value
        order: 'asc', // Backend value
    });

    // Form
    const { handleSubmit, reset, setValue, watch } = useForm<CreateEmployeePayload>({
        defaultValues: { role: 'SELLER' }, // Backend value
    });
    const formValues = watch();

    // Get available roles for create/edit dialog - use backend values
    const getAvailableFormRoles = (): Array<{ label: string; value: string }> => {
        // Base roles - ADMIN, MANAGER, SELLER (excluding SUPERADMIN and OWNER)
        const baseRoles = EMPLOYEE_FILTER_OPTIONS.formRole;

        // If current user is SUPERADMIN, they can create any role except themselves
        // If current user is OWNER, they can only create standard roles
        console.log('[EmployeesPage] Current user role:', currentUser?.role);
        console.log('[EmployeesPage] Available roles for form:', baseRoles);

        return baseRoles;
    };

    const availableFormRoles = getAvailableFormRoles();

    // Fetch employees when dependencies change

    useEffect(() => {
        // For OWNER: must select market first
        if (currentUser?.role === 'OWNER' && !selectedMarket?.id) {
            setEmployees([]);
            setError('Avval market tanlang');
            setLoading(false);
            return;
        }

        // Reset page to 0 when dependencies change (except page/limit)
        if (page !== 0) {
            setPage(0);
            return;
        }

        setError(null);
        if (selectedMarket?.id) {
            fetchEmployees();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMarket?.id, filters, page, limit, currentUser?.role]);

    const fetchEmployees = async () => {
        if (!selectedMarket?.id && currentUser?.role === 'OWNER') {
            setError('Avval market tanlang');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Build query parameters with backend values
            const queryParams = buildQueryParams(filters, page, limit);

            console.log('[EmployeesPage] Market ID:', selectedMarket?.id);
            console.log('[EmployeesPage] Page:', page, 'Limit:', limit);
            console.log('[EmployeesPage] Filters (backend values):', filters);
            console.log('[EmployeesPage] Final query params for API:', queryParams);

            // Fetch employees using market-specific endpoint
            const marketId = selectedMarket?.id || '';
            const response = await employeesApi.getMarketEmployees(
                marketId,
                queryParams
            );

            const data = response.data as MarketUsersResponse;

            console.log('[EmployeesPage] Response received:');
            console.log('  - Employees count:', data.data.length);
            console.log('  - Total:', data.meta.total);
            console.log('  - Total pages:', data.meta.totalPages);

            setEmployees(data.data);
            setTotal(data.meta.total);
            setTotalPages(data.meta.totalPages);
        } catch (err) {
            const message = (err instanceof Error)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ? (err as any)?.response?.data?.message || err.message
                : 'Xodimlarni yuklab olishda xatolik';
            setError(message);
            console.error('[EmployeesPage] Error:', {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                message: (err as any)?.message,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: (err as any)?.response?.status,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: (err as any)?.response?.data,
            });
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof EmployeeFilters, value: string | 'asc' | 'desc') => {
        // Reset page when filters change
        setPage(0);
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleCreateClick = () => {
        setEditingEmployee(null);
        setDialogError('');
        reset();
        setOpenDialog(true);
    };

    const handleEditClick = (employee: MarketUser) => {
        setEditingEmployee(employee);
        setValue('fullName', employee.fullName);
        setValue('email', employee.email);
        setValue('phone', employee.phone || '');
        setValue('role', employee.role);
        setDialogError('');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingEmployee(null);
        setDialogError('');
        reset();
    };

    const handleDeleteEmployee = async (employeeId: number) => {
        if (!window.confirm('Haqiqatdan ham o\'chirilsinmi?')) return;

        try {
            await employeesApi.deleteEmployee(employeeId);
            setEmployees(employees.filter(e => e.id !== employeeId));
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = ((err as any)?.response?.data?.message) || 'O\'chirishda xatolik';
            setError(message);
            console.error('[EmployeesPage] Delete error:', err);
        }
    };

    const onSubmit = async (data: CreateEmployeePayload) => {
        setSubmitting(true);
        setDialogError('');

        try {
            // OWNER role MUST select market first
            if (currentUser?.role === 'OWNER' && !selectedMarket?.id) {
                setDialogError('Avval market tanlang');
                setSubmitting(false);
                return;
            }

            const payload: CreateEmployeePayload = {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                role: data.role, // Already backend value (ADMIN, MANAGER, SELLER)
            };

            if (!editingEmployee && data.password) {
                payload.password = data.password;
            }

            // ALWAYS add marketId when market is selected (works for OWNER and SUPERADMIN)
            if (selectedMarket?.id) {
                payload.marketId = selectedMarket.id as string;
            }

            console.log('[EmployeesPage] === CREATE EMPLOYEE SUBMIT ===');
            console.log('[EmployeesPage] Current User:', currentUser?.role);
            console.log('[EmployeesPage] Selected Market ID:', selectedMarket?.id);
            console.log('[EmployeesPage] Selected Market Name:', selectedMarket?.name);
            console.log('[EmployeesPage] Final Payload:', JSON.stringify(payload, null, 2));
            console.log('[EmployeesPage] === END SUBMIT ===');

            if (editingEmployee) {
                delete payload.password;
                await employeesApi.updateEmployee(editingEmployee.id, payload);
            } else {
                await employeesApi.createEmployee(payload);
            }

            console.log('[EmployeesPage] Success! Fetching updated data...');
            await fetchEmployees();
            handleCloseDialog();
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = ((err as any)?.response?.data?.message) || 'Xatolik yuz berdi';
            setDialogError(message);
            console.error('[EmployeesPage] Submit error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePageChange = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLimit(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Format date
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('uz-UZ');
        } catch {
            return dateString;
        }
    };

    // No market selected state
    if (currentUser?.role === 'OWNER' && !selectedMarket?.id) {
        return (
            <Box sx={{ p: 3 }}>
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                            Avval market tanlang
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Market sahifasiga o'tib, tanlangan marketni ko'rishni boshlang
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header with Market Info */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        Xodimlar
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
                    onClick={handleCreateClick}
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

            {/* Filters Row 1: Search, Status, Role */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                {/* Search */}
                <TextField
                    fullWidth
                    placeholder="Ism yoki email bo'yicha qidirish..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    }}
                    size="small"
                />

                {/* Status Filter - Sends backend values (active, inactive) */}
                <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={filters.status}
                        label="Status"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        {EMPLOYEE_FILTER_OPTIONS.status.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Role Filter - Sends backend values (ADMIN, MANAGER, SELLER) */}
                <FormControl fullWidth size="small">
                    <InputLabel>Rol</InputLabel>
                    <Select
                        value={filters.role}
                        label="Rol"
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                    >
                        {EMPLOYEE_FILTER_OPTIONS.role.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Filters Row 2: Sort By, Order */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                {/* Sort By - Sends backend values (fullName, email, createdAt) */}
                <FormControl fullWidth size="small">
                    <InputLabel>Sortlash</InputLabel>
                    <Select
                        value={filters.sortBy}
                        label="Sortlash"
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                        {EMPLOYEE_FILTER_OPTIONS.sortBy.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Order - Sends backend values (asc, desc) */}
                <FormControl fullWidth size="small">
                    <InputLabel>Tartib</InputLabel>
                    <Select
                        value={filters.order}
                        label="Tartib"
                        onChange={(e) => handleFilterChange('order', e.target.value as 'asc' | 'desc')}
                    >
                        {EMPLOYEE_FILTER_OPTIONS.order.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Loading State */}
            {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            )}

            {/* Table */}
            {!loading && (
                <>
                    <Paper>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Ism</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Telefon</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Qo'sh sanasi</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Amallar</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.length > 0 ? (
                                    employees.map((employee) => (
                                        <TableRow key={employee.id} hover>
                                            <TableCell>{employee.fullName}</TableCell>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>{employee.phone || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getRoleLabel(employee.role)}
                                                    size="small"
                                                    variant="outlined"
                                                    color={
                                                        employee.role === 'ADMIN'
                                                            ? 'info'
                                                            : employee.role === 'MANAGER'
                                                                ? 'success'
                                                                : employee.role === 'SELLER'
                                                                    ? 'warning'
                                                                    : 'default'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusLabel(employee.status as 'active' | 'inactive')}
                                                    size="small"
                                                    color={employee.status === 'active' ? 'success' : 'error'}
                                                />
                                            </TableCell>
                                            <TableCell>{formatDate(employee.createdAt)}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEditClick(employee)}
                                                    title="Tahrirlash"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteEmployee(employee.id)}
                                                    title="O'chirish"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                            <Typography color="text.secondary">
                                                {filters.search || filters.status || filters.role
                                                    ? 'Qidiruv bo\'yicha natija topilmadi'
                                                    : 'Xodimlar yo\'q'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Paper>

                    {/* Pagination */}
                    {employees.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Jami: {total} xodim (Sahifa {page + 1}/{totalPages})
                            </Typography>
                            <TablePagination
                                component="div"
                                count={total}
                                page={page}
                                onPageChange={handlePageChange}
                                rowsPerPage={limit}
                                onRowsPerPageChange={handleLimitChange}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                labelRowsPerPage="Sahifada:"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}–${to} / ${count !== -1 ? count : `${to}dan ko'p`}`
                                }
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingEmployee ? 'Xodimni tahrirlash' : 'Yangi Xodim'}
                </DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {/* Market Selection Info for OWNER */}
                        {currentUser?.role === 'OWNER' && !editingEmployee && (
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

                        {!editingEmployee && (
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
                                {availableFormRoles.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
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
                                (!editingEmployee && currentUser?.role === 'OWNER' && !selectedMarket?.id)
                            }
                        >
                            {submitting ? <CircularProgress size={24} /> : editingEmployee ? 'Saqlash' : 'Qo\'shish'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
