import { useState, useMemo } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, IconButton, TextField,
  CircularProgress, Alert, InputAdornment, Card, CardContent,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon,
  Delete as DeleteIcon, Search as SearchIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../api/endpoints/categories.api';
import { useAuthStore } from '../../store/auth.store';
import { useMarketStore } from '../../store/market.store';
import type { Category, UpdateCategoryPayload, CreateCategoryPayload } from '../../types/category.types';
import CategoryDialog from '../../components/categories/CategoryDialog';
import ConfirmDeleteDialog from '../../components/categories/ConfirmDeleteDialog';
import dayjs from 'dayjs';

/**
 * CategoriesPage - Refactored Categories Management
 * Features:
 * - List all categories for selected market
 * - Create/Edit/Delete with full CRUD flow
 * - imageUrl field support
 * - GET /categories/:id for edit form loading
 * - Search functionality
 * - Role-based access control
 */
export default function CategoriesPage() {
  const { user: currentUser } = useAuthStore();
  const { selectedMarket } = useMarketStore();
  const queryClient = useQueryClient();

  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [dialogError, setDialogError] = useState('');

  const marketId = selectedMarket?.id;

  // Permissions
  const canManage = currentUser && ['SUPERADMIN', 'OWNER', 'ADMIN'].includes(currentUser.role);

  console.log('[CategoriesPage] Role:', currentUser?.role, 'Can manage:', canManage);

  // Query: Fetch all categories
  const { data: categories = [], isLoading, error: fetchError } = useQuery({
    queryKey: ['categories', marketId, searchQuery],
    queryFn: async () => {
      if (!marketId) return [];

      const response = await categoriesApi.getCategories({
        marketId,
        search: searchQuery || undefined,
      });

      console.log('[CategoriesPage] Fetched categories:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!marketId,
  });

  // Query: Fetch single category for editing
  const { data: categoryDetail } = useQuery({
    queryKey: ['category', editingCategory?.id],
    queryFn: () => categoriesApi.getCategoryById(editingCategory!.id),
    enabled: !!editingCategory?.id,
  });

  // Mutation: Create category
  const createMutation = useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      console.log('[CategoriesPage] Creating category:', payload);
      return categoriesApi.createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', marketId] });
      setDialogOpen(false);
      setDialogError('');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Kategoriya yaratishda xatolik yuz berdi';
      console.error('[CategoriesPage] Create error:', message);
      setDialogError(message);
    },
  });

  // Mutation: Update category
  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateCategoryPayload) => {
      if (!editingCategory?.id) throw new Error('Kategoriya ID yo\'q');
      console.log('[CategoriesPage] Updating category:', { id: editingCategory.id, payload });
      return categoriesApi.updateCategory(editingCategory.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', marketId] });
      setDialogOpen(false);
      setEditingCategory(null);
      setDialogError('');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Kategoriya tahrirlashda xatolik yuz berdi';
      console.error('[CategoriesPage] Update error:', message);
      setDialogError(message);
    },
  });

  // Mutation: Delete category
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('[CategoriesPage] Deleting category:', id);
      return categoriesApi.deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', marketId] });
      setDeleteConfirm(null);
    },
    onError: (err: any) => {
      console.error('[CategoriesPage] Delete error:', err);
    },
  });

  // Handlers
  const handleOpenCreateDialog = () => {
    setEditingCategory(null);
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setEditingCategory(category);
    setDialogError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setDialogError('');
  };

  const handleSubmitDialog = async (data: UpdateCategoryPayload) => {
    console.log('[CategoriesPage] handleSubmitDialog called with data:', data);

    if (!selectedMarket?.id) {
      console.warn('[CategoriesPage] Market not selected');
      setDialogError('Tanlangan market noto\'g\'ri');
      return;
    }

    if (!data.name?.trim()) {
      console.warn('[CategoriesPage] Category name is empty');
      setDialogError('Kategoriya nomi majburiy');
      return;
    }

    if (editingCategory) {
      // Update: send only name and imageUrl (NO marketId)
      console.log('[CategoriesPage] UPDATE mode - sending UpdateCategoryPayload:', data);
      updateMutation.mutate(data);
    } else {
      // Create: send marketId, name, imageUrl
      const createPayload: CreateCategoryPayload = {
        name: data.name,
        imageUrl: data.imageUrl || undefined,
        marketId: selectedMarket.id,
      };

      console.log('[CategoriesPage] CREATE mode - payload to send:', {
        marketId: createPayload.marketId,
        name: createPayload.name,
        imageUrl: createPayload.imageUrl,
        hasFallbackImageUrl: !!createPayload.imageUrl,
      });

      createMutation.mutate(createPayload);
    }
  };

  const handleDeleteConfirm = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleDeleteSubmit = () => {
    if (deleteConfirm?.id) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  };

  // Filter categories locally if search is not handled by backend
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // UI States
  if (!marketId) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (fetchError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Kategoriyalarni yuklashda xatolik: {fetchError instanceof Error ? fetchError.message : 'Noma\'lum xatolik'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Kategoriyalar</Typography>
        {canManage && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Yangi kategoriya
          </Button>
        )}
      </Box>

      {/* Search */}
      <Paper sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Kategoriya nomini qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
          size="small"
        />
      </Paper>

      {/* Empty State */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">
              {searchQuery ? 'Natija topilmadi' : 'Kategoriyalar yo\'q'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        /* Table */
        <Paper sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nomi</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Rasm</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Yaratilgan</TableCell>
                {canManage && <TableCell align="center" sx={{ fontWeight: 'bold' }}>Harakatlar</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((category: Category) => (
                <TableRow key={category.id} hover>
                  <TableCell sx={{ fontWeight: 500, maxWidth: 300 }}>
                    {category.name}
                  </TableCell>
                  <TableCell>
                    {category.imageUrl ? (
                      <Avatar
                        src={category.imageUrl}
                        alt={category.name}
                        sx={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 40, height: 40, bgcolor: '#e0e0e0' }}>
                        <ImageIcon sx={{ color: '#999' }} />
                      </Avatar>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.createdAt ? dayjs(category.createdAt).format('DD.MM.YYYY') : '—'}
                  </TableCell>
                  {canManage && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(category)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteConfirm(category.id, category.name)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <CategoryDialog
        open={dialogOpen}
        category={editingCategory ? (categoryDetail?.data || editingCategory) : null}
        isLoading={createMutation.isPending || updateMutation.isPending}
        error={dialogError}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitDialog}
        title={editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya yaratish'}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteConfirm}
        categoryName={deleteConfirm?.name || ''}
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteSubmit}
      />
    </Box>
  );
}
