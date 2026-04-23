/**
 * Admin - Contracts Page
 * 
 * Market-scoped contract management with payment tracking
 * Pattern: Same as AdminProductsPage + payment operations
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
    Chip,
    Tab,
    Tabs,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Search as SearchIcon,
    Payment as PaymentIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useAdminMarketStore } from '../../store/admin-market.store';
import { adminApi } from '../../api/endpoints/admin.api';

interface Contract {
    id: string;
    customerId: string;
    customerName?: string;
    monthlyAmount: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    dueDate?: string;
}

interface Installment {
    id: string;
    contractId: string;
    amount: string;
    dueDate: string;
    paidDate?: string;
    status: 'PENDING' | 'PAID';
}

interface CreateContractInput {
    customerId: string;
    monthlyAmount: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

interface RecordPaymentInput {
    amount: string;
    date: string;
}

function TabPanel(props: any) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
}

export default function AdminContractsPage() {
    // ============================================================================
    // STATE
    // ============================================================================

    const { adminMarketId } = useAdminMarketStore();

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);

    const [tabValue, setTabValue] = useState(0);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateContractInput>();
    const { control: paymentControl, handleSubmit: handlePaymentSubmit, reset: resetPayment, formState: { errors: paymentErrors } } = useForm<RecordPaymentInput>();

    // ============================================================================
    // SECURITY CHECK: Admin must have market assigned
    // ============================================================================

    useEffect(() => {
        if (!adminMarketId) {
            console.warn('[AdminContractsPage] ❌ NO MARKET ASSIGNED');
            setError('Market not assigned. Contact administrator.');
            setLoading(false);
            return;
        }

        fetchContracts();
    }, [adminMarketId, search]);

    // ============================================================================
    // FETCH CONTRACTS - MARKET SCOPED
    // ============================================================================

    const fetchContracts = async () => {
        if (!adminMarketId) {
            console.error('[AdminContractsPage] ❌ No marketId - STOPPING API call');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('[AdminContractsPage] Fetching contracts for market:', adminMarketId);

            const params: any = {};
            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await adminApi.contract.getAll(adminMarketId, params);

            let data = Array.isArray(response.data) ? response.data : response.data?.data || [];

            console.log('[AdminContractsPage] ✅ Fetched', data.length, 'contracts');
            setContracts(data);
        } catch (err) {
            console.error('[AdminContractsPage] ❌ Error fetching contracts:', err);
            const message = err instanceof Error ? err.message : 'Failed to fetch contracts';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // FETCH INSTALLMENTS FOR CONTRACT
    // ============================================================================

    const fetchInstallments = async (contractId: string) => {
        try {
            console.log('[AdminContractsPage] Fetching installments for contract:', contractId);

            const response = await adminApi.contract.getInstallments(contractId);

            let data = Array.isArray(response.data) ? response.data : response.data?.data || [];

            console.log('[AdminContractsPage] ✅ Fetched', data.length, 'installments');
            setInstallments(data);
        } catch (err) {
            console.error('[AdminContractsPage] ❌ Error fetching installments:', err);
            const message = err instanceof Error ? err.message : 'Failed to fetch installments';
            setError(message);
        }
    };

    // ============================================================================
    // CREATE / UPDATE CONTRACT
    // ============================================================================

    const onSubmit = async (data: CreateContractInput) => {
        if (!adminMarketId) {
            console.error('[AdminContractsPage] ❌ No marketId - STOPPING API call');
            return;
        }

        setSubmitting(true);
        try {
            console.log('[AdminContractsPage] Submitting contract:', data);

            if (editingContract) {
                // UPDATE
                await adminApi.contract.update(editingContract.id, data);
                console.log('[AdminContractsPage] ✅ Contract updated');
            } else {
                // CREATE
                const payload = {
                    ...data,
                    marketId: adminMarketId,
                };
                await adminApi.contract.create(payload);
                console.log('[AdminContractsPage] ✅ Contract created');
            }

            setOpenDialog(false);
            setEditingContract(null);
            reset();
            await fetchContracts();
        } catch (err) {
            console.error('[AdminContractsPage] ❌ Error submitting contract:', err);
            const message = err instanceof Error ? err.message : 'Failed to save contract';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================================================
    // RECORD PAYMENT
    // ============================================================================

    const onRecordPayment = async (data: RecordPaymentInput) => {
        if (!selectedContract) return;

        setPaymentSubmitting(true);
        try {
            console.log('[AdminContractsPage] Recording payment for contract:', selectedContract.id);

            await adminApi.contract.recordPayment(selectedContract.id, data);

            console.log('[AdminContractsPage] ✅ Payment recorded');
            setOpenPaymentDialog(false);
            resetPayment();
            await fetchInstallments(selectedContract.id);
        } catch (err) {
            console.error('[AdminContractsPage] ❌ Error recording payment:', err);
            const message = err instanceof Error ? err.message : 'Failed to record payment';
            setError(message);
        } finally {
            setPaymentSubmitting(false);
        }
    };


    // ============================================================================
    // EDIT CONTRACT
    // ============================================================================

    const handleEdit = (contract: Contract) => {
        setEditingContract(contract);
        reset({
            customerId: contract.customerId,
            monthlyAmount: contract.monthlyAmount,
            status: contract.status,
        });
        setOpenDialog(true);
    };

    // ============================================================================
    // VIEW CONTRACT DETAILS
    // ============================================================================

    const handleViewDetails = async (contract: Contract) => {
        setSelectedContract(contract);
        await fetchInstallments(contract.id);
        setTabValue(0);
    };

    // ============================================================================
    // FILTER & SEARCH
    // ============================================================================

    const filtered = contracts.filter((contract) =>
        contract.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        contract.customerId.toLowerCase().includes(search.toLowerCase()),
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
                        Contracts
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        Market: <strong>{adminMarketId}</strong>
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditingContract(null);
                        reset();
                        setOpenDialog(true);
                    }}
                >
                    Add Contract
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
                placeholder="Search contracts..."
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
                            <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Monthly Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length > 0 ? (
                            filtered.map((contract) => (
                                <TableRow key={contract.id} hover>
                                    <TableCell>{contract.customerName || contract.customerId}</TableCell>
                                    <TableCell>{contract.monthlyAmount}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={contract.status}
                                            size="small"
                                            color={contract.status === 'ACTIVE' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>{new Date(contract.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewDetails(contract)}
                                            title="View Details"
                                        >
                                            <PaymentIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(contract)}
                                            title="Edit"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <Typography color="textSecondary">
                                        {search ? 'No contracts found' : 'No contracts yet'}
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
                    {editingContract ? 'Edit Contract' : 'Add Contract'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <form>
                        <Controller
                            name="customerId"
                            control={control}
                            rules={{ required: 'Customer ID is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Customer ID"
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.customerId}
                                    helperText={errors.customerId?.message}
                                />
                            )}
                        />

                        <Controller
                            name="monthlyAmount"
                            control={control}
                            rules={{ required: 'Monthly amount is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Monthly Amount"
                                    fullWidth
                                    margin="normal"
                                    type="number"
                                    error={!!errors.monthlyAmount}
                                    helperText={errors.monthlyAmount?.message}
                                />
                            )}
                        />

                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Status"
                                    fullWidth
                                    margin="normal"
                                    select
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </TextField>
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

            {/* CONTRACT DETAILS DIALOG */}
            <Dialog
                open={!!selectedContract}
                onClose={() => {
                    setSelectedContract(null);
                    setTabValue(0);
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Contract Details - {selectedContract?.customerName || selectedContract?.customerId}
                </DialogTitle>
                <DialogContent>
                    <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tab label="Installments" />
                        <Tab label="Info" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Paid Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {installments?.length > 0 ? (
                                    installments.map((installment) => (
                                        <TableRow key={installment.id}>
                                            <TableCell>{installment.amount}</TableCell>
                                            <TableCell>{new Date(installment.dueDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={installment.status}
                                                    size="small"
                                                    color={installment.status === 'PAID' ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>{installment.paidDate ? new Date(installment.paidDate).toLocaleDateString() : '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No installments</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <Button
                            variant="contained"
                            startIcon={<PaymentIcon />}
                            onClick={() => setOpenPaymentDialog(true)}
                            sx={{ mt: 2 }}
                        >
                            Record Payment
                        </Button>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Box>
                            <Typography><strong>Monthly Amount:</strong> {selectedContract?.monthlyAmount}</Typography>
                            <Typography><strong>Status:</strong> {selectedContract?.status}</Typography>
                            <Typography><strong>Created:</strong> {selectedContract?.createdAt ? new Date(selectedContract.createdAt).toLocaleDateString() : '-'}</Typography>
                            <Typography><strong>Due Date:</strong> {selectedContract?.dueDate ? new Date(selectedContract.dueDate).toLocaleDateString() : '-'}</Typography>
                        </Box>
                    </TabPanel>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setSelectedContract(null);
                        setTabValue(0);
                    }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* PAYMENT DIALOG */}
            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <form>
                        <Controller
                            name="amount"
                            control={paymentControl}
                            rules={{ required: 'Amount is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Amount"
                                    fullWidth
                                    margin="normal"
                                    type="number"
                                    error={!!paymentErrors.amount}
                                    helperText={paymentErrors.amount?.message}
                                />
                            )}
                        />

                        <Controller
                            name="date"
                            control={paymentControl}
                            rules={{ required: 'Date is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Payment Date"
                                    fullWidth
                                    margin="normal"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!paymentErrors.date}
                                    helperText={paymentErrors.date?.message}
                                />
                            )}
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handlePaymentSubmit(onRecordPayment)}
                        variant="contained"
                        disabled={paymentSubmitting}
                    >
                        {paymentSubmitting ? 'Recording...' : 'Record Payment'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
