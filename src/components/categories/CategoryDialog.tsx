import { useState, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Alert, CircularProgress, Box,
    Avatar, Stack, IconButton, Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { uploadApi } from '../../api/endpoints/uploads.api';
import type { Category, UpdateCategoryPayload } from '../../types/category.types';

interface CategoryDialogProps {
    open: boolean;
    category: Category | null;
    isLoading?: boolean;
    error?: string;
    onClose: () => void;
    onSubmit: (data: UpdateCategoryPayload) => void;
    title?: string;
}

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function CategoryDialog({
    open,
    category,
    isLoading = false,
    error,
    onClose,
    onSubmit,
    title = category ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya yaratish',
}: CategoryDialogProps) {
    const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<UpdateCategoryPayload>({
        defaultValues: {
            name: category?.name || '',
            imageUrl: category?.imageUrl || '',
        },
    });

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Watch imageUrl to show preview
    const imageUrl = watch('imageUrl');

    // File upload state
    const [uploadError, setUploadError] = useState('');
    const [previewFile, setPreviewFile] = useState<string | null>(imageUrl || null);
    const [selectedFileName, setSelectedFileName] = useState('');

    // File validation helper
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Faqat rasm fayllari mumkin (JPEG, PNG, WebP)';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'Fayl hajmi 5MB dan katta bo\'lmasligi kerak';
        }
        return null;
    };

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            console.log('[CategoryDialog] Starting upload mutation for file:', file.name);
            setUploadError('');

            const validationError = validateFile(file);
            if (validationError) {
                console.warn('[CategoryDialog] File validation failed:', validationError);
                throw new Error(validationError);
            }

            console.log('[CategoryDialog] File validation passed, calling uploadApi...');
            return uploadApi.uploadCategoryImage(file);
        },
        onSuccess: (data) => {
            console.log('[CategoryDialog] Upload onSuccess:', {
                imageUrl: data.imageUrl,
                fileName: data.fileName,
            });
            setValue('imageUrl', data.imageUrl);
            setPreviewFile(data.imageUrl);
            setUploadError('');
        },
        onError: (err: any) => {
            console.error('[CategoryDialog] Upload onError:', err);

            let errorMsg = 'Rasm yuklashda xatolik';

            if (err instanceof Error) {
                errorMsg = err.message;
            } else if (err?.response) {
                errorMsg = err.response.data?.message || err.response.data?.error || 'Server xatosi';
                console.error('[CategoryDialog] Upload response error:', {
                    status: err.response.status,
                    data: err.response.data,
                });
            } else if (err?.message) {
                errorMsg = err.message;
            }

            console.error('[CategoryDialog] Final error message:', errorMsg);
            setUploadError(errorMsg);
        },
    });

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('[CategoryDialog] handleFileChange triggered');

        const file = event.target.files?.[0];
        if (!file) {
            console.warn('[CategoryDialog] No file selected');
            return;
        }

        console.log('[CategoryDialog] File selected:', {
            name: file.name,
            size: file.size,
            type: file.type,
        });

        // Store file name
        setSelectedFileName(file.name);

        // Create preview immediately (before upload)
        console.log('[CategoryDialog] Creating preview with FileReader...');
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = e.target?.result as string;
            console.log('[CategoryDialog] Preview created, length:', preview?.length);
            setPreviewFile(preview);
        };
        reader.onerror = () => {
            console.error('[CategoryDialog] FileReader error');
        };
        reader.readAsDataURL(file);

        // Start upload
        console.log('[CategoryDialog] Triggering upload mutation...');
        uploadMutation.mutate(file);
    };

    // Open file picker dialog
    const handleOpenFilePicker = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Remove image
    const handleRemoveImage = () => {
        setValue('imageUrl', '');
        setPreviewFile(null);
        setSelectedFileName('');
        setUploadError('');
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        reset();
        setPreviewFile(null);
        setUploadError('');
        onClose();
    };

    const isUploading = uploadMutation.isPending;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

                <TextField
                    fullWidth
                    label="Kategoriya nomi"
                    placeholder="Masalan: Elektronika"
                    {...register('name', { required: 'Nomi majburiy' })}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    margin="normal"
                    required
                    disabled={isLoading || isUploading}
                />

                {/* Image Upload Section */}
                <Box sx={{ mt: 3, mb: 2 }}>
                    <Stack spacing={2}>
                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleFileChange}
                            disabled={isLoading || isUploading}
                            style={{ display: 'none' }}
                        />

                        {/* Upload Button */}
                        <Button
                            variant="outlined"
                            startIcon={isUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                            onClick={handleOpenFilePicker}
                            fullWidth
                            disabled={isLoading || isUploading}
                            sx={{ py: 1.5 }}
                        >
                            {isUploading ? 'Yuklanyapti...' : 'Rasm tanlang'}
                        </Button>

                        {/* Selected File Name */}
                        {selectedFileName && (
                            <Typography variant="body2" color="textSecondary" sx={{ pl: 1 }}>
                                📎 {selectedFileName}
                            </Typography>
                        )}

                        {/* Preview */}
                        {previewFile && (
                            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                <Avatar
                                    src={previewFile}
                                    alt="Rasm preview"
                                    sx={{ width: 100, height: 100 }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={handleRemoveImage}
                                    disabled={isLoading || isUploading}
                                    sx={{
                                        position: 'absolute',
                                        top: -8,
                                        right: -8,
                                        bgcolor: 'error.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'error.dark' },
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
                    </Stack>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading || isUploading}>
                    Bekor qilish
                </Button>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                    disabled={isLoading || isUploading}
                >
                    {isLoading || isUploading ? <CircularProgress size={24} /> : (category ? 'Saqlash' : 'Qo\'shish')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
