import { useState, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Button, Table, TableBody, TableCell,
    TableHead, TableRow, Chip, TextField,
    CircularProgress, Alert, InputAdornment, Select,
    MenuItem, FormControl, InputLabel,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { contractsApi } from '../../api';
import { useMarketStore } from '../../store/market.store';
import type { Contract } from '../../types';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';

type ContractStatusKey = 'active' | 'draft' | 'expired' | 'terminated' | 'completed' | 'overdue' | 'cancelled';

const getContractStatusKey = (status?: string): ContractStatusKey => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE':
            return 'active';
        case 'COMPLETED':
            return 'completed';
        case 'OVERDUE':
            return 'overdue';
        case 'CANCELLED':
            return 'cancelled';
        case 'EXPIRED':
            return 'expired';
        case 'TERMINATED':
            return 'terminated';
        default:
            return 'draft';
    }
};

const statusColors: Record<ContractStatusKey, 'success' | 'default' | 'warning' | 'info' | 'error'> = {
    active: 'success',
    completed: 'info',
    overdue: 'warning',
    cancelled: 'error',
    draft: 'default',
    expired: 'warning',
    terminated: 'error',
};

const statusIcons: Record<ContractStatusKey, ReactElement> = {
    active: <CheckCircleIcon fontSize="small" />,
    completed: <TaskAltIcon fontSize="small" />,
    overdue: <ScheduleIcon fontSize="small" />,
    cancelled: <CancelIcon fontSize="small" />,
    draft: <ScheduleIcon fontSize="small" />,
    expired: <ScheduleIcon fontSize="small" />,
    terminated: <CancelIcon fontSize="small" />,
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
        const matchStatus = statusFilter ? c.status?.toUpperCase() === statusFilter : true;
        return matchSearch && matchStatus;
    });

    if (!marketId) return <Alert severity="info">Iltimos, market tanlang</Alert>;
    if (isLoading) return <CircularProgress />;

    return (
        <Box>
            <PageHeader
                eyebrow="Contracts"
                title="Shartnomalar"
                subtitle="To'lovlar, muddatlar va mijozga bog'liq barcha shartnomalarni nazorat qiling."
                action={(
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/contracts/create')}
                    >
                        Yangi shartnoma
                    </Button>
                )}
            />

            <DataTable
                title="Shartnomalar ro'yxati"
                subtitle="Shartnoma raqami, mijoz va holat bo'yicha qidiring."
                toolbar={(
                    <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
                        <TextField
                            placeholder="Shartnoma yoki mijoz..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                            sx={{ flex: 1 }}
                        />
                        <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
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
                )}
            >
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
                                    {(() => {
                                        const statusKey = getContractStatusKey(contract.status);

                                        return (
                                    <Chip
                                        label={contract.status}
                                        icon={statusIcons[statusKey]}
                                        size="small"
                                        color={statusColors[statusKey]}
                                        variant="filled"
                                    />
                                        );
                                    })()}
                                </TableCell>
                                <TableCell>{dayjs(contract.startDate).format('DD.MM.YYYY')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DataTable>
        </Box>
    );
}
