/**
 * Admin - Customers Page
 * 
 * Market-scoped customer management
 * Pattern: Same as AdminProductsPage
 */

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
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAdminMarketStore } from '../../store/admin-market.store';
import { adminApi } from '../../api/endpoints/admin.api';

interface Customer {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    address?: string;
    createdAt: string;
}

interface CreateCustomerInput {
    fullName: string;
    email?: string;
    phone?: string;
    address?: string;
}

export default function AdminCustomersPage() {
    // ============================================================================
    // STATE
    // ============================================================================

    const { adminMarketId } = useAdminMarketStore();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateCustomerInput>();

    // ============================================================================
    // SECURITY CHECK: Admin must have market assigned
    // ============================================================================

    useEffect(() => {
        if (!adminMarketId) {
            console.warn('[AdminCustomersPage] ❌ NO MARKET ASSIGNED');
            setError('Market not assigned. Contact administrator.');
            setLoading(false);
            return;
        }

        fetchCustomers();
    }, [adminMarketId, search]);

    // ============================================================================
    // FETCH CUSTOMERS - MARKET SCOPED
    // ============================================================================

    const fetchCustomers = async () => {
        if (!adminMarketId) {
            console.error('[AdminCustomersPage] ❌ No marketId - STOPPING API call');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('[AdminCustomersPage] Fetching customers for market:', adminMarketId);

            const params: any = {};
            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await adminApi.customer.getAll(adminMarketId, params);

            let data = Array.isArray(response.data) ? response.data : response.data?.data || [];

            console.log('[AdminCustomersPage] ✅ Fetched', data.length, 'customers');
            setCustomers(data);
        } catch (err) {
            console.error('[AdminCustomersPage] ❌ Error fetching customers:', err);
            const message = err instanceof Error ? err.message : 'Failed to fetch customers';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // CREATE / UPDATE CUSTOMER
    // ============================================================================

    const onSubmit = async (data: CreateCustomerInput) => {
        if (!adminMarketId) {
            console.error('[AdminCustomersPage] ❌ No marketId - STOPPING API call');
            return;
        }

        setSubmitting(true);
        try {
            console.log('[AdminCustomersPage] Submitting customer:', data);

            if (editingCustomer) {
                // UPDATE
                await adminApi.customer.update(editingCustomer.id, data);
                console.log('[AdminCustomersPage] ✅ Customer updated');
            } else {
                // CREATE
                const payload = {
                    ...data,
                    marketId: adminMarketId,
                };
                await adminApi.customer.create(payload);
                console.log('[AdminCustomersPage] ✅ Customer created');
            }

            setOpenDialog(false);
            setEditingCustomer(null);
            reset();
            await fetchCustomers();
        } catch (err) {
            console.error('[AdminCustomersPage] ❌ Error submitting customer:', err);
            const message = err instanceof Error ? err.message : 'Failed to save customer';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================================================
    // DELETE CUSTOMER
    // ============================================================================

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this customer?')) return;

        try {
            console.log('[AdminCustomersPage] Deleting customer:', id);
            await adminApi.customer.delete(id);
            console.log('[AdminCustomersPage] ✅ Customer deleted');
            setCustomers(customers.filter(c => c.id !== id));
        } catch (err) {
            console.error('[AdminCustomersPage] ❌ Error deleting customer:', err);
            const message = err instanceof Error ? err.message : 'Failed to delete customer';
            setError(message);
        }
    };

    // ============================================================================
    // EDIT CUSTOMER
    // ============================================================================

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        reset({
            fullName: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
        });
        setOpenDialog(true);
    };

    // ============================================================================
    // FILTER & SEARCH
    // ============================================================================

    const filtered = customers.filter((customer) =>
        customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(search.toLowerCase()),
    );

    // ============================================================================
    // RENDER
    // ============================================================================

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!adminMarketId) {
        return (
            <Alert severity="error">
                ❌ Market not assigned. Admin can only access their assigned market.
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <div>
                    <Typography variant="h5" fontWeight="bold">
                        Customers
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        Market: <strong>{adminMarketId}</strong>
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditingCustomer(null);
                        reset();
                        setOpenDialog(true);
                    }}
                >
                    Add Customer
                </Button>
            </Box>

            {/* ERROR ALERT */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* SEARCH */}
            <TextField
                fullWidth
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                sx={{ mb: 2 }}
            />

            {/* TABLE */}
            <Paper>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length > 0 ? (
                            filtered.map((customer) => (
                                <TableRow key={customer.id} hover>
                                    <TableCell>{customer.fullName}</TableCell>
                                    <TableCell>{customer.email || '-'}</TableCell>
                                    <TableCell>{customer.phone || '-'}</TableCell>
                                    <TableCell>{customer.address || '-'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(customer)}
                                            title="Edit"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(customer.id)}
                                            title="Delete"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <Typography color="textSecondary">
                                        {search ? 'No customers found' : 'No customers yet'}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* CREATE/EDIT DIALOG */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCustomer ? 'Edit Customer' : 'Add Customer'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <form>
                        <Controller
                            name="fullName"
                            control={control}
                            rules={{ required: 'Name is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Full Name"
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.fullName}
                                    helperText={errors.fullName?.message}
                                />
                            )}
                        />

                        <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Email"
                                    fullWidth
                                    margin="normal"
                                    type="email"
                                />
                            )}
                        />

                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Phone"
                                    fullWidth
                                    margin="normal"
                                />
                            )}
                        />

                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Address"
                                    fullWidth
                                    margin="normal"
                                    multiline
                                    rows={3}
                                />
                            )}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
