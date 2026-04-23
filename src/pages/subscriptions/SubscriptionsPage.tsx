import { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, Chip, Select, MenuItem,
  FormControl, InputLabel, Snackbar, Skeleton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { subscriptionsApi } from '../../api/endpoints/subscriptions.api';
import dayjs from 'dayjs';

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Toast state
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch current subscription
  const { data: currentSubResponse, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['subscriptions-current'],
    queryFn: () => subscriptionsApi.getCurrent(),
    retry: false
  });
  const currentSub = currentSubResponse?.data;

  // Fetch available plans
  const { data: plansResponse, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['subscriptions-plans'],
    queryFn: () => subscriptionsApi.getPlans(),
  });
  const plans = plansResponse?.data || [];

  // Fetch subscription history
  const { data: historyResponse, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['subscriptions-history'],
    queryFn: () => subscriptionsApi.getHistory(),
  });
  const history = historyResponse?.data?.items || [];

  const { control, reset, handleSubmit } = useForm({
    defaultValues: {
      paymentMethod: 'credit_card'
    }
  });

  const payMutation = useMutation({
    mutationFn: (data: { planId: string; paymentMethod: string }) =>
      subscriptionsApi.pay(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions-current'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-history'] });
      setPaymentOpen(false);
      reset();
      setToast({ open: true, message: "To'lov muvaffaqiyatli amalga oshirildi!", severity: 'success' });
    },
    onError: () => {
      setToast({ open: true, message: "To'lovda xatolik yuz berdi. Qaytadan urinib ko'ring.", severity: 'error' });
    }
  });

  const handleSubscribeClick = (planId: string) => {
    setSelectedPlan(planId);
    setPaymentOpen(true);
  };

  const onSubmitPayment = (data: { paymentMethod: string }) => {
    if (selectedPlan) {
      payMutation.mutate({
        planId: selectedPlan,
        paymentMethod: data.paymentMethod,
      });
    }
  };

  const isAnyLoading = isLoadingCurrent || isLoadingPlans || isLoadingHistory;

  if (isAnyLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width="200px" height={40} sx={{ mb: 4 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          <Box>
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
          </Box>
          <Box>
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
          </Box>
          <Box>
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  const isSubActive = currentSub?.status === 'active';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" fontWeight="bold" mb={4} color="text.primary">
        Obunani Boshqarish
      </Typography>

      {/* 1. CURRENT SUBSCRIPTION */}
      <Box mb={6}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Joriy obuna
        </Typography>
        {currentSub && isSubActive ? (
          <Card elevation={0} sx={{ border: '2px solid', borderColor: 'primary.main', borderRadius: 3, bgcolor: 'primary.50' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4, alignItems: 'center' }}>
                <Box>
                  <Typography color="primary.main" fontWeight="bold" variant="overline">
                    Faol Tarif
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="text.primary" mt={1}>
                    {currentSub.plan?.name || 'Standard'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" mt={1}>
                    {currentSub.plan?.price?.toLocaleString() || 0} so'm
                  </Typography>
                </Box>
                <Box sx={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">Status</Typography>
                      <Chip
                        label="Faol"
                        color="success"
                        size="small"
                        sx={{ mt: 0.5, fontWeight: 'bold' }}
                      />
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="body2">Amal qilish muddati</Typography>
                      <Typography fontWeight="medium" mt={0.5}>
                        {dayjs(currentSub.endDate).format('DD.MM.YYYY')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="body2">Boshlangan sana</Typography>
                      <Typography fontWeight="medium" mt={0.5}>
                        {dayjs(currentSub.startDate).format('DD.MM.YYYY')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography color="text.secondary" variant="body2">Yangilash sanasi</Typography>
                      <Typography fontWeight="medium" mt={0.5}>
                        {dayjs(currentSub.renewalDate).format('DD.MM.YYYY')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
      ) : (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        Sizda hozircha faol obuna yo'q. Iltimos quyidagi tariflardan birini tanlang.
      </Alert>
        )}
    </Box>

      {/* 2. AVAILABLE PLANS */ }
  <Box mb={6}>
    <Typography variant="h6" fontWeight="bold" mb={3}>
      Mavjud Ta'riflar
    </Typography>
    {plans.length === 0 ? (
      <Typography color="text.secondary">Tariflar topilmadi.</Typography>
    ) : (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
        {plans.map((plan) => {
          const isCurrentPlan = currentSub?.planId === plan.id && isSubActive;

          return (
            <Box key={plan.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: isCurrentPlan ? 'primary.main' : 'divider',
                  borderRadius: 3,
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 2
                  }
                }}
              >
                {isCurrentPlan && (
                  <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                    <Chip label="Joriy Tarif" color="primary" size="small" />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                      {plan.price.toLocaleString()} so'm
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                      / {plan.durationDays || 30} kun
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    {plan.features?.map((feature, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20, mr: 1.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
                <Box sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isCurrentPlan ? "outlined" : "contained"}
                    color="primary"
                    size="large"
                    startIcon={!isCurrentPlan && <CreditCardIcon />}
                    disabled={isCurrentPlan}
                    onClick={() => handleSubscribeClick(plan.id)}
                    sx={{ borderRadius: 2, textTransform: 'none', py: 1.5, fontWeight: 'bold' }}
                  >
                    {isCurrentPlan ? "Faol" : "Obuna bo'lish"}
                  </Button>
                </Box>
              </Card>
            </Box>
          );
        })}
      </Box>
    )}
  </Box>

  {/* 3. PAYMENT HISTORY */ }
  <Box>
    <Typography variant="h6" fontWeight="bold" mb={3}>
      To'lov tarixi
    </Typography>
    {history.length > 0 ? (
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Tarif nomi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>To'lov sanasi</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Holat</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Miqdor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.plan?.name || 'Unknown'}</TableCell>
                <TableCell>{dayjs(item.paymentDate).format('DD.MM.YYYY HH:mm')}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    size="small"
                    color={item.status === 'active' ? 'success' : (item.status === 'expired' ? 'error' : 'default')}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                  {item.amount?.toLocaleString()} so'm
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    ) : (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 3 }}>
        <Typography color="text.secondary">
          Sizda hozircha to'lov tarixi mavjud emas.
        </Typography>
      </Paper>
    )}
  </Box>

  {/* PAYMENT DIALOG */ }
  <Dialog
    open={paymentOpen}
    onClose={() => !payMutation.isPending && setPaymentOpen(false)}
    maxWidth="sm"
    fullWidth
    PaperProps={{ sx: { borderRadius: 3 } }}
  >
    <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
      To'lovni amalga oshirish
    </DialogTitle>
    <DialogContent>
      <Typography color="text.secondary" mb={3}>
        Iltimos, o'zingizga qulay to'lov usulini tanlang.
      </Typography>
      <form id="payment-form" onSubmit={handleSubmit(onSubmitPayment)}>
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth>
              <InputLabel>To'lov usuli</InputLabel>
              <Select {...field} label="To'lov usuli">
                <MenuItem value="credit_card">Kredit karta (Uzcard/Humo)</MenuItem>
                <MenuItem value="bank_transfer">Bank o'tkazmasi</MenuItem>
                <MenuItem value="cash">Naqd pul</MenuItem>
              </Select>
            </FormControl>
          )}
        />
      </form>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button
        onClick={() => setPaymentOpen(false)}
        disabled={payMutation.isPending}
        sx={{ textTransform: 'none' }}
      >
        Bekor qilish
      </Button>
      <Button
        type="submit"
        form="payment-form"
        variant="contained"
        disabled={payMutation.isPending}
        startIcon={payMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <CreditCardIcon />}
        sx={{ textTransform: 'none', px: 3 }}
      >
        {payMutation.isPending ? "To'lov qilinmoqda..." : "To'lash"}
      </Button>
    </DialogActions>
  </Dialog>

  {/* TOAST NOTIFICATION */ }
  <Snackbar
    open={toast.open}
    autoHideDuration={6000}
    onClose={() => setToast(prev => ({ ...prev, open: false }))}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
  >
    <Alert
      onClose={() => setToast(prev => ({ ...prev, open: false }))}
      severity={toast.severity}
      variant="filled"
      sx={{ width: '100%', borderRadius: 2 }}
    >
      {toast.message}
    </Alert>
  </Snackbar>
    </Box >
  );
}