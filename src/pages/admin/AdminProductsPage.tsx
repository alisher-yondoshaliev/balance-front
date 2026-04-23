/**
 * Admin - Products Page
 * 
 * Architecture:
 * 1. Get admin's marketId from store
 * 2. Fetch products for that market ONLY
 * 3. Provide CRUD operations
 * 4. Safe rendering - check data before map
 * 
 * Security:
 * - ONLY show products for admin's market
 * - NEVER allow global or other market access
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
    Chip,
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

interface Product {
    id: string;
    name: string;
    description?: string;
    basePrice: string;
    stock: number;
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    categoryId?: string;
    createdAt: string;
}

interface CreateProductInput {
    name: string;
    description?: string;
    basePrice: string;
    stock: number;
    categoryId?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

/**
 * Products Page - Admin only, market-scoped
 * 
 * Usage:
 * Admin sees ONLY their market products
 * Cannot access other markets or global data
 */
export default function AdminProductsPage() {
    // ============================================================================
    // STATE
    // ============================================================================

    const { adminMarketId } = useAdminMarketStore();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateProductInput>({
        defaultValues: { status: 'ACTIVE' },
    });

    // ============================================================================
    // SECURITY CHECK: Admin must have market assigned
    // ============================================================================

    useEffect(() => {
        if (!adminMarketId) {
            console.warn('[AdminProductsPage] ❌ NO MARKET ASSIGNED - Cannot fetch products');
            setError('Market not assigned. Contact administrator.');
            setLoading(false);
            return;
        }

        fetchProducts();
    }, [adminMarketId, search]);

    // ============================================================================
    // FETCH PRODUCTS - MARKET SCOPED
    // ============================================================================

    const fetchProducts = async () => {
        if (!adminMarketId) {
            console.error('[AdminProductsPage] ❌ No marketId - STOPPING API call');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('[AdminProductsPage] Fetching products for market:', adminMarketId);

            // ✅ IMPORTANT: ALWAYS send marketId with search
            const params: any = {};
            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await adminApi.product.getAll(adminMarketId, params);

            // Handle response
            let data = Array.isArray(response.data) ? response.data : response.data?.data || [];

            console.log('[AdminProductsPage] ✅ Fetched', data.length, 'products');
            setProducts(data);
        } catch (err) {
            console.error('[AdminProductsPage] ❌ Error fetching products:', err);
            const message = err instanceof Error ? err.message : 'Failed to fetch products';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================================
    // CREATE / UPDATE PRODUCT
    // ============================================================================

    const onSubmit = async (data: CreateProductInput) => {
        if (!adminMarketId) {
            console.error('[AdminProductsPage] ❌ No marketId - STOPPING API call');
            return;
        }

        setSubmitting(true);
        try {
            console.log('[AdminProductsPage] Submitting product:', data);

            if (editingProduct) {
                // UPDATE
                await adminApi.product.update(editingProduct.id, data);
                console.log('[AdminProductsPage] ✅ Product updated');
            } else {
                // CREATE
                const payload = {
                    ...data,
                    marketId: adminMarketId, // ✅ MUST include marketId
                };
                await adminApi.product.create(payload);
                console.log('[AdminProductsPage] ✅ Product created');
            }

            setOpenDialog(false);
            setEditingProduct(null);
            reset();
            await fetchProducts(); // Refresh list
        } catch (err) {
            console.error('[AdminProductsPage] ❌ Error submitting product:', err);
            const message = err instanceof Error ? err.message : 'Failed to save product';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================================================
    // DELETE PRODUCT
    // ============================================================================

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this product?')) return;

        try {
            console.log('[AdminProductsPage] Deleting product:', id);
            await adminApi.product.delete(id);
            console.log('[AdminProductsPage] ✅ Product deleted');
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            console.error('[AdminProductsPage] ❌ Error deleting product:', err);
            const message = err instanceof Error ? err.message : 'Failed to delete product';
            setError(message);
        }
    };

    // ============================================================================
    // EDIT PRODUCT
    // ============================================================================

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        reset({
            name: product.name,
            description: product.description,
            basePrice: product.basePrice,
            stock: product.stock,
            categoryId: product.categoryId,
            status: product.status,
        });
        setOpenDialog(true);
    };

    // ============================================================================
    // FILTER & SEARCH
    // ============================================================================

    const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase()),
    );

    // ============================================================================
    // RENDER - LOADING / ERROR / EMPTY
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
                        Products
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        Market: <strong>{adminMarketId}</strong>
                    </Typography>
                </div>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setEditingProduct(null);
                        reset();
                        setOpenDialog(true);
                    }}
                >
                    Add Product
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
                placeholder="Search products..."
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
                            <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.length > 0 ? (
                            filtered.map((product) => (
                                <TableRow key={product.id} hover>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.basePrice}</TableCell>
                                    <TableCell>{product.stock}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={product.status}
                                            size="small"
                                            color={product.status === 'ACTIVE' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEdit(product)}
                                            title="Edit"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(product.id)}
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
                                        {search ? 'No products found' : 'No products yet'}
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
                    {editingProduct ? 'Edit Product' : 'Add Product'}
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
                            name="basePrice"
                            control={control}
                            rules={{ required: 'Price is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Price"
                                    fullWidth
                                    margin="normal"
                                    type="number"
                                    error={!!errors.basePrice}
                                    helperText={errors.basePrice?.message}
                                />
                            )}
                        />

                        <Controller
                            name="stock"
                            control={control}
                            rules={{ required: 'Stock is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Stock"
                                    fullWidth
                                    margin="normal"
                                    type="number"
                                    error={!!errors.stock}
                                    helperText={errors.stock?.message}
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
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="ARCHIVED">Archived</option>
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
        </Box>
    );
}
