import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, Table, TableBody, TableCell,
    TableHead, TableRow, IconButton, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    CircularProgress, Alert, InputAdornment, Chip, Snackbar,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon,
    Delete as DeleteIcon, Search as SearchIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { customersApi } from '../../api';
import type { CreateCustomerInput, UpdateCustomerInput } from '../../api';
import { useMarketStore } from '../../store/market.store';
import type { Customer } from '../../types';
import dayjs from 'dayjs';
import { extractApiErrorMessage } from '../../api/error';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

export default function CustomersPage() {
    const navigate = useNavigate();
    const { selectedMarket } = useMarketStore();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [editItem, setEditItem] = useState<Customer | null>(null);
    const [search, setSearch] = useState('');
    const [dialogError, setDialogError] = useState('');
    const [submitSuccessMessage, setSubmitSuccessMessage] = useState('');

    const marketId = selectedMarket?.id || '';

    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers', marketId],
        queryFn: () => customersApi.getAll(marketId).then((r) => r.data),
        enabled: !!marketId,
    });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm<CreateCustomerInput>();

    const createMutation = useMutation({
        mutationFn: (data: CreateCustomerInput & { marketId: string }) => customersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setOpen(false);
            setDialogError('');
            setSubmitSuccessMessage("Mijoz muvaffaqiyatli qo'shildi");
            reset();
        },
        onError: (error) => {
            const message = extractApiErrorMessage(error, "Mijozni saqlab bo'lmadi");
            setDialogError(message);

            if (message.toLowerCase().includes('passport')) {
                setError('passportSeria', { type: 'server', message });
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) =>
            customersApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setOpen(false);
            setDialogError('');
            setSubmitSuccessMessage('Mijoz muvaffaqiyatli yangilandi');
            reset();
        },
        onError: (error) => {
            const message = extractApiErrorMessage(error, "Mijozni yangilab bo'lmadi");
            setDialogError(message);

            if (message.toLowerCase().includes('passport')) {
                setError('passportSeria', { type: 'server', message });
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: customersApi.remove,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
    });

    const onSubmit = (data: CreateCustomerInput) => {
        clearErrors();
        setDialogError('');
        setSubmitSuccessMessage('');

        if (editItem) {
            updateMutation.mutate({ id: editItem.id, data });
        } else {
            createMutation.mutate({ ...data, marketId });
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditItem(customer);
        setDialogError('');
        setSubmitSuccessMessage('');
        setValue('fullName', customer.fullName);
        if (customer.phone) setValue('phone', customer.phone);
        if (customer.address) setValue('address', customer.address);
        if (customer.passportSeria) setValue('passportSeria', customer.passportSeria);
        if (customer.note) setValue('note', customer.note);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditItem(null);
        setDialogError('');
        clearErrors();
        reset();
    };

    const filtered = customers?.filter((c) =>
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone?.includes(search) ?? false),
    );

    if (!marketId) return <Alert severity="info">Iltimos, market tanlang</Alert>;
    if (isLoading) return <CircularProgress />;

    return (
        <Box>
            <PageHeader
                eyebrow="Customers"
                title="Mijozlar"
                subtitle="Mijozlar bazasi, passport ma'lumotlari va shartnoma faolligini boshqaring."
                action={(
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                        Mijoz qo'shish
                    </Button>
                )}
            />

            <DataTable
                title="Mijozlar ro'yxati"
                subtitle="Ism, telefon va passport bo'yicha tez qidiruv."
                toolbar={(
                    <TextField
                        fullWidth
                        placeholder="Ism yoki telefon bo'yicha qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                    />
                )}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ism</TableCell>
                            <TableCell>Telefon</TableCell>
                            <TableCell>Passport</TableCell>
                            <TableCell>Shartnomalar</TableCell>
                            <TableCell>Sana</TableCell>
                            <TableCell align="right">Amallar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered?.map((customer) => (
                            <TableRow key={customer.id} hover>
                                <TableCell>{customer.fullName}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>{customer.passportSeria || '-'}</TableCell>
                                <TableCell>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <Chip label={(customer as any)._count?.contracts || 0} size="small" />
                                </TableCell>
                                <TableCell>{dayjs(customer.createdAt).format('DD.MM.YYYY')}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => navigate(`/customers/${customer.id}`)}>
                                        <ViewIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleEdit(customer)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(customer.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DataTable>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editItem ? 'Mijoz tahrirlash' : 'Yangi mijoz'}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        {dialogError ? (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {dialogError}
                            </Alert>
                        ) : null}

                        <TextField fullWidth label="To'liq ism" {...register('fullName')} sx={{ mb: 2 }} required />
                        <TextField fullWidth label="Telefon" {...register('phone')} sx={{ mb: 2 }} required />
                        <TextField fullWidth label="Manzil" {...register('address')} sx={{ mb: 2 }} />
                        <TextField
                            fullWidth
                            label="Passport seriya"
                            {...register('passportSeria')}
                            sx={{ mb: 2 }}
                            error={!!errors.passportSeria}
                            helperText={errors.passportSeria?.message}
                        />
                        <TextField fullWidth label="Izoh" {...register('note')} multiline rows={2} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Bekor qilish</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editItem ? 'Saqlash' : 'Qo\'shish'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={!!submitSuccessMessage}
                autoHideDuration={4000}
                onClose={() => setSubmitSuccessMessage('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => setSubmitSuccessMessage('')}
                    sx={{ width: '100%' }}
                >
                    {submitSuccessMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
