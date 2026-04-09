import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, IconButton, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, InputAdornment, Chip,
  Select, MenuItem, FormControl, InputLabel, Grid,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon, Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { productsApi } from '../../api';
import type { CreateProductInput, UpdateProductInput } from '../../api';
import { useMarketStore } from '../../store/market.store';
import { categoriesApi } from '../../api/endpoints/categories.api';
import type { Product, Category } from '../../types';
import dayjs from 'dayjs';

const statusColors: Record<'active' | 'inactive', 'success' | 'error'> = {
  active: 'success',
  inactive: 'error',
};

export default function ProductsPage() {
  const navigate = useNavigate();
  const { selectedMarket } = useMarketStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const marketId = selectedMarket?.id || '';

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', marketId],
    queryFn: () => productsApi.getAll(marketId).then((r) => r.data),
    enabled: !!marketId,
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories', marketId],
    queryFn: () => categoriesApi.getAll(marketId).then((r) => r.data),
    enabled: !!marketId,
  });

  const { control, register, handleSubmit, reset, setValue } = useForm<CreateProductInput>({
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      stock: 0,
      basePrice: 0,
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProductInput & { marketId: string }) =>
      productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpen(false);
      setEditItem(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteConfirm(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      productsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data });
    } else {
      createMutation.mutate({ ...data, marketId });
    }
  });

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditItem(product);
      setValue('name', product.name);
      setValue('description', product.description);
      setValue('categoryId', product.categoryId);
      setValue('stock', product.stock);
      setValue('basePrice', product.price);
    } else {
      setEditItem(null);
      reset();
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditItem(null);
    reset();
  };

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Mahsulotlar</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Yangi mahsulot
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Mahsulot qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ p: 2 }}
        />
      </Paper>

      {filteredProducts.length === 0 ? (
        <Alert severity="info">Mahsulotlar yo'q</Alert>
      ) : (
        <Paper sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Nomi</TableCell>
                <TableCell>Kategoriya</TableCell>
                <TableCell align="right">Narxi</TableCell>
                <TableCell align="right">Zaxira</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Yaratilgan</TableCell>
                <TableCell align="center">Harakatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {categories?.find((c) => c.id === product.categoryId)?.name || '-'}
                  </TableCell>
                  <TableCell align="right">{product.price.toLocaleString()} so'm</TableCell>
                  <TableCell align="right">{product.stock}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.status}
                      size="small"
                      color={statusColors[product.status as keyof typeof statusColors]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{dayjs(product.createdAt).format('DD.MM.YYYY')}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(product)}
                      title="Tahrirlash"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirm(product.id)}
                      title="O'chirish"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editItem ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot yaratish'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mahsulot nomi"
                {...register('name', { required: 'Nomi majburiy' })}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Kategoriya</InputLabel>
                    <Select
                      {...field}
                      label="Kategoriya"
                    >
                      {categories?.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tavsif"
                multiline
                rows={3}
                {...register('description')}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Narxi"
                type="number"
                inputProps={{ step: '0.01' }}
                {...register('basePrice', { valueAsNumber: true })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Zaxira"
                type="number"
                {...register('stock', { valueAsNumber: true })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Bekor qilish</Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>O'chirishni tasdiqlaш</DialogTitle>
        <DialogContent>
          <Typography>Siz bu mahsulotni o'chirishga rozimisiz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Bekor qilish</Button>
          <Button
            onClick={() => deleteConfirm && deleteMutation.mutate(deleteConfirm)}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            O'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}