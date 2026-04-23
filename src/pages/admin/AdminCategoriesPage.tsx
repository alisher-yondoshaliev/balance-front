/**
 * Admin - Categories Page
 * 
 * Market-scoped category management
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

interface Category {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    createdAt: string;
}

interface CreateCategoryInput {
    name: string;
    description?: string;
    imageUrl?: string;
}

export default function AdminCategoriesPage() {
    // ============================================================================
    // STATE
    // ============================================================================

    const { adminMarketId } = useAdminMarketStore();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateCategoryInput>();

    // ============================================================================
    // SECURITY CHECK: Admin must have market assigned
    // ============================================================================

    useEffect(() => {
        if (!adminMarketId) {
            console.warn('[AdminCategoriesPage] ❌ NO MARKET ASSIGNED');
            setError('Market not assigned. Contact administrator.');
            setLoading(false);
            return;
        }

        fetchCategories();
    }, [adminMarketId, search]);

    // ============================================================================
    // FETCH CATEGORIES - MARKET SCOPED
    // ============================================================================

    const fetchCategories = async () => {
        if (!adminMarketId) {
            console.error('[AdminCategoriesPage] ❌ No marketId - STOPPING API call');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('[AdminCategoriesPage] Fetching categories for market:', adminMarketId);

            const params: any = {};
            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await adminApi.category.getAll(adminMarketId, params);

            let data = Array.isArray(response.data) ? response.data : response.data?.data || [];

            console.log('[AdminCategoriesPage] ✅ Fetched', data.length, 'categories');
            setCategories(data);
        } catch (err) {
            console.error('[AdminCategoriesPage] ❌ Error fetching categories:', err);
            const message = err instanceof Error ? err.message : 'Failed to fetch categories';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // CREATE / UPDATE CATEGORY
    // ============================================================================

    const onSubmit = async (data: CreateCategoryInput) => {
        if (!adminMarketId) {
            console.error('[AdminCategoriesPage] ❌ No marketId - STOPPING API call');
            return;
        }

        setSubmitting(true);
        try {
            console.log('[AdminCategoriesPage] Submitting category:', data);

            if (editingCategory) {
                // UPDATE
                await adminApi.category.update(editingCategory.id, data);
                console.log('[AdminCategoriesPage] ✅ Category updated');
            } else {
                // CREATE
                const payload = {
                    ...data,
                    marketId: adminMarketId,
                };
                await adminApi.category.create(payload);
                console.log('[AdminCategoriesPage] ✅ Category created');
            }

            setOpenDialog(false);
            setEditingCategory(null);
            reset();
            await fetchCategories();
        } catch (err) {
            console.error('[AdminCategoriesPage] ❌ Error submitting category:', err);
            const message = err instanceof Error ? err.message : 'Failed to save category';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================================================
    // DELETE CATEGORY
    // ============================================================================

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this category?')) return;

        try {
            console.log('[AdminCategoriesPage] Deleting category:', id);
            await adminApi.category.delete(id);
            console.log('[AdminCategoriesPage] ✅ Category deleted');
            setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
            console.error('[AdminCategoriesPage] ❌ Error deleting category:', err);
            const message = err instanceof Error ? err.message : 'Failed to delete category';
            setError(message);
        }
    };

    // ============================================================================
    // EDIT CATEGORY
    // ============================================================================

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        reset({
            name: category.name,
            description: category.description,
            imageUrl: category.imageUrl,
        });
        setOpenDialog(true);
    };

    // ============================================================================
    // FILTER & SEARCH
    // ============================================================================

    const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.description?.toLowerCase().includes(search.toLowerCase()),
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
                        Categories
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        Market: <strong>{adminMarketId}</strong>
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditingCategory(null);
                        reset();
                        setOpenDialog(true);
                    }}
                >
                    Add Category
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
                placeholder="Search categories..."
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
                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length > 0 ? (
                            filtered.map((category) => (
                                <TableRow key={category.id} hover>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.description || '-'}</TableCell>
                                    <TableCell>
                                        {category.imageUrl ? (
                                            <img
                                                src={category.imageUrl}
                                                alt={category.name}
                                                style={{ width: 50, height: 50, borderRadius: 4, objectFit: 'cover' }}
                                            />
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(category)}
                                            title="Edit"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(category.id)}
                                            title="Delete"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                    <Typography color="textSecondary">
                                        {search ? 'No categories found' : 'No categories yet'}
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
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <form>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Name is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Name"
                                    fullWidth
                                    margin="normal"
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Description"
                                    fullWidth
                                    margin="normal"
                                    multiline
                                    rows={3}
                                />
                            )}
                        />

                        <Controller
                            name="imageUrl"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Image URL"
                                    fullWidth
                                    margin="normal"
                                    placeholder="https://example.com/image.jpg"
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
