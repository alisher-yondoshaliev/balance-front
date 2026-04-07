import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableHead, TableRow, Paper, Chip, TextField,
    CircularProgress, Alert, InputAdornment, Select,
    MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { contractsApi } from '../../api';
import { useMarketStore } from '../../store/market.store';
import type { Contract, ContractStatus } from '../../types';
import dayjs from 'dayjs';

const statusColors: Record<ContractStatus, 'success' | 'default' | 'warning' | 'info' | 'error'> = {
    active: 'success',
    draft: 'default',
    expired: 'warning',
    terminated: 'error',
};

export default function ContractsPage() {
    const navigate = useNavigate();
    const { selectedMarket } = useMarketStore();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const marketId = selectedMarket?.id || '';

    const { data: contracts, isLoading } = useQuery<Contract[]>({
        queryKey: ['contracts', marketId],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryFn: () => contractsApi.getAll(marketId).then((r: any) => r.data),
        enabled: !!marketId,
    });

    const filtered = contracts?.filter((c) => {
        const matchSearch =
            c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
            c.customer?.fullName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter ? c.status === statusFilter : true;
        return matchSearch && matchStatus;
    });

    if (!marketId) return <Alert severity="info">Iltimos, market tanlang</Alert>;
    if (isLoading) return <CircularProgress />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">Shartnomalar</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/contracts/create')}
                >
                    Yangi shartnoma
                </Button>
            </Box>

            <Box display="flex" gap={2} mb={2}>
                <TextField
                    placeholder="Shartnoma yoki mijoz..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                    sx={{ flex: 1 }}
                />
                <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel>Holat</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Holat"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="">Hammasi</MenuItem>
                        <MenuItem value="ACTIVE">Faol</MenuItem>
                        <MenuItem value="COMPLETED">Tugallangan</MenuItem>
                        <MenuItem value="OVERDUE">Muddati o'tgan</MenuItem>
                        <MenuItem value="CANCELLED">Bekor qilingan</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Raqam</TableCell>
                            <TableCell>Mijoz</TableCell>
                            <TableCell align="right">Jami summa</TableCell>
                            <TableCell align="right">To'langan</TableCell>
                            <TableCell align="right">Qoldi</TableCell>
                            <TableCell>Muddat</TableCell>
                            <TableCell>Holat</TableCell>
                            <TableCell>Sana</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {filtered?.map((contract: any) => (
                            <TableRow
                                key={contract.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/contracts/${contract.id}`)}
                            >
                                <TableCell>{contract.contractNumber}</TableCell>
                                <TableCell>{contract.customer?.fullName}</TableCell>
                                <TableCell align="right">
                                    {Number(contract.totalAmount).toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                    {Number(contract.paidAmount).toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                    {Number(contract.remainAmount).toLocaleString()}
                                </TableCell>
                                <TableCell>{contract.termMonths} oy</TableCell>
                                <TableCell>
                                    <Chip
                                        label={contract.status}
                                        size="small"
                                        color={statusColors[contract.status as ContractStatus] || 'default'}
                                    />
                                </TableCell>
                                <TableCell>{dayjs(contract.startDate).format('DD.MM.YYYY')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}