import { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CardActions,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Grid, Chip, Select, MenuItem,
  FormControl, InputLabel,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { subscriptionsApi } from '../../api/endpoints/subscriptions.api';
import { useMarketStore } from '../../store/market.store';
import dayjs from 'dayjs';

export default function SubscriptionsPage() {
  const { selectedMarket } = useMarketStore();
  const queryClient = useQueryClient();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Fetch current subscription
  const { data: currentSub, isLoading } = useQuery({
    queryKey: ['subscriptions-current'],
    queryFn: () => subscriptionsApi.getCurrent().then((r) => r.data),
  });

  // Fetch subscription history
  const { data: history } = useQuery({
    queryKey: ['subscriptions-history'],
    queryFn: () => subscriptionsApi.getHistory().then((r) => r.data?.items || []),
  });

  const { control, reset } = useForm();

  const payMutation = useMutation({
    mutationFn: (data: { planId: string; paymentMethod: string }) =>
      subscriptionsApi.pay(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions-current'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-history'] });
      setPaymentOpen(false);
      reset();
    },
  });

  const handlePayment = (planId: string) => {
    setSelectedPlan(planId);
    setPaymentOpen(true);
  };

  if (!selectedMarket) {
    return (
      <Alert severity="warning">
        Avval market tanlang
      </Alert>
    );
  }

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Obunalar
      </Typography>

      {/* Current Subscription */}
      <Box mb={4}>
        <Typography variant="h6" mb={2}>
          Joriy obuna
        </Typography>
        {currentSub ? (
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Plan nomi
                  </Typography>
                  <Typography variant="h6">{currentSub.plan?.name || 'Standard'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={currentSub.status}
                    color={currentSub.status === 'active' ? 'success' : 'default'}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Boshlanish sanasi
                  </Typography>
                  <Typography>{dayjs(currentSub.startDate).format('DD.MM.YYYY')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Tugash sanasi
                  </Typography>
                  <Typography>{dayjs(currentSub.endDate).format('DD.MM.YYYY')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Yangilash sanasi
                  </Typography>
                  <Typography>{dayjs(currentSub.renewalDate).format('DD.MM.YYYY')}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography color="textSecondary" gutterBottom>
                    Narxi
                  </Typography>
                  <Typography variant="h6">
                    {currentSub.plan?.price?.toLocaleString()} so'm
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                startIcon={<CreditCardIcon />}
                onClick={() => handlePayment(currentSub.planId)}
              >
                To'lov qilish
              </Button>
            </CardActions>
          </Card>
        ) : (
          <Alert severity="info">
            Hozircha active obuna yo'q
          </Alert>
        )}
      </Box>

      {/* Subscription History */}
      <Box>
        <Typography variant="h6" mb={2}>
          To'lov tarixi
        </Typography>
        {history && history.length > 0 ? (
          <Paper sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Plan nomi</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Boshlanish</TableCell>
                  <TableCell>Tugash</TableCell>
                  <TableCell align="right">Narxi</TableCell>
                  <TableCell>To'lov sanasi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.plan?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        color={item.status === 'active' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{dayjs(item.startDate).format('DD.MM.YYYY')}</TableCell>
                    <TableCell>{dayjs(item.endDate).format('DD.MM.YYYY')}</TableCell>
                    <TableCell align="right">{item.amount?.toLocaleString()} so'm</TableCell>
                    <TableCell>{dayjs(item.paymentDate).format('DD.MM.YYYY')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : (
          <Alert severity="info">
            To'lov tarixi yo'q
          </Alert>
        )}
      </Box>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>To'lov qilish</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="paymentMethod"
                control={control}
                defaultValue="credit_card"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>To'lov usuli</InputLabel>
                    <Select
                      {...field}
                      label="To'lov usuli"
                    >
                      <MenuItem value="credit_card">Kredit karta</MenuItem>
                      <MenuItem value="debit_card">Debit karta</MenuItem>
                      <MenuItem value="bank_transfer">Bank o'tkazma</MenuItem>
                      <MenuItem value="cash">Naqd pul</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentOpen(false)}>Bekor qilish</Button>
          <Button
            onClick={() => {
              if (selectedPlan) {
                payMutation.mutate({
                  planId: selectedPlan,
                  paymentMethod: 'credit_card',
                });
              }
            }}
            variant="contained"
            disabled={payMutation.isPending}
          >
            To'lovni tasdiqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}