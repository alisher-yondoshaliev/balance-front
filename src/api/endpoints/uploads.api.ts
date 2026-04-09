import api from '../axios';

/**
 * Upload API Service
 * Handles file uploads for categories and other resources
 */

export interface UploadResponse {
    message: string;
    imageUrl: string;
    fileName: string;
}

export const uploadApi = {
    /**
     * POST /api/uploads/category-image
     * Upload category image
     * Uploads file as FormData with multipart/form-data
     */
    uploadCategoryImage: (file: File): Promise<UploadResponse> => {
        console.log('[uploadApi] Uploading category image - START', {
            fileName: file.name,
            size: file.size,
            type: file.type,
            endpoint: '/uploads/category-image',
        });

        const formData = new FormData();
        formData.append('file', file);

        // Log FormData entries for debugging
        console.log('[uploadApi] FormData entries:', Array.from(formData.entries()));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return api.post<any>('/uploads/category-image', formData, {
            headers: {
                // IMPORTANT: Do NOT set Content-Type header for FormData
                // Browser will automatically set: multipart/form-data; boundary=...
                // Explicitly setting it causes 400 Bad Request
            },
        }).then(response => {
            console.log('[uploadApi] Upload response received:', response.status, response.data);

            // Handle both wrapped and unwrapped responses
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (response.data as any)?.imageUrl ? response.data : ((response.data as any)?.data || response.data) as UploadResponse;

            console.log('[uploadApi] Upload success - END', {
                imageUrl: data.imageUrl,
                fileName: data.fileName,
            });

            return data;
        }).catch(err => {
            const errorMsg = err?.response?.data?.message || err?.message || 'Unknown error';
            const errorStatus = err?.response?.status;

            console.error('[uploadApi] Upload FAILED', {
                status: errorStatus,
                message: errorMsg,
                error: err,
            });

            throw new Error(errorMsg);
        });
    },
};
