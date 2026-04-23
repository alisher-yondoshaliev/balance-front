import axios from 'axios';

type ErrorPayload = {
    message?: string | string[];
    error?: string;
    details?: string[];
    errors?: string[];
};

const pickMessage = (value: unknown): string | null => {
    if (typeof value === 'string' && value.trim()) {
        return value.trim();
    }

    if (Array.isArray(value)) {
        const firstMessage = value.find(
            (item): item is string => typeof item === 'string' && item.trim().length > 0,
        );

        return firstMessage?.trim() ?? null;
    }

    return null;
};

export const extractApiErrorMessage = (
    error: unknown,
    fallback = "So'rovni bajarib bo'lmadi.",
): string => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as ErrorPayload | undefined;

        return (
            pickMessage(payload?.message) ??
            pickMessage(payload?.details) ??
            pickMessage(payload?.errors) ??
            pickMessage(payload?.error) ??
            error.message ??
            fallback
        );
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message.trim();
    }

    return fallback;
};
