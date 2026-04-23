/**
 * PlanModal Component
 * Modal for creating/editing subscription plans
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { SubscriptionPlan, CreatePlanInput } from '../../types/subscription.types';

interface PlanModalProps {
    isOpen: boolean;
    plan?: SubscriptionPlan | null;
    onClose: () => void;
    onSubmit: (data: CreatePlanInput) => Promise<void>;
    isLoading?: boolean;
    error?: string | null;
}

export const PlanModal: React.FC<PlanModalProps> = ({
    isOpen,
    plan,
    onClose,
    onSubmit,
    isLoading = false,
    error = null,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreatePlanInput>({
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            duration: 30,
            features: [],
            isActive: true,
            maxUsers: undefined,
            maxStorage: undefined,
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (plan) {
            reset({
                name: plan.name,
                description: plan.description ?? undefined,
                price: plan.price,
                duration: plan.duration,
                features: plan.features,
                isActive: plan.isActive,
                maxUsers: plan.maxUsers,
                maxStorage: plan.maxStorage,
            });
        } else {
            reset();
        }
    }, [plan, reset]);

    const handleFormSubmit = async (data: CreatePlanInput) => {
        try {
            await onSubmit(data);
            reset();
            onClose();
        } catch (err) {
            console.error('Form submission error:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 z-50 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h2 className="text-xl font-bold text-gray-900">
                        {plan ? 'Edit Plan' : 'Create Plan'}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Plan Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Professional"
                            {...register('name', {
                                required: 'Plan name is required',
                                minLength: { value: 3, message: 'Name must be at least 3 characters' },
                            })}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-blue-200'
                                }`}
                        />
                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Description
                        </label>
                        <textarea
                            placeholder="Describe this plan..."
                            {...register('description')}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>

                    {/* Price & Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Price ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                {...register('price', {
                                    required: 'Price is required',
                                    min: { value: 0, message: 'Price must be positive' },
                                })}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.price
                                    ? 'border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:ring-blue-200'
                                    }`}
                            />
                            {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Duration (days) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                placeholder="30"
                                {...register('duration', {
                                    required: 'Duration is required',
                                    min: { value: 1, message: 'Duration must be at least 1 day' },
                                })}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.duration
                                    ? 'border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:ring-blue-200'
                                    }`}
                            />
                            {errors.duration && (
                                <p className="text-red-600 text-sm mt-1">{errors.duration.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Max Users & Storage */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Max Users
                            </label>
                            <input
                                type="number"
                                placeholder="e.g., 5"
                                {...register('maxUsers', {
                                    min: { value: 1, message: 'Must be at least 1' },
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Max Storage (GB)
                            </label>
                            <input
                                type="number"
                                placeholder="e.g., 100"
                                {...register('maxStorage', {
                                    min: { value: 0.1, message: 'Must be at least 0.1' },
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Features (comma-separated)
                        </label>
                        <textarea
                            placeholder="Feature 1, Feature 2, Feature 3..."
                            {...register('features')}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separate features with commas. They will be split automatically.
                        </p>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            {...register('isActive')}
                            className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-blue-200"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                            Active (visible to users)
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
                        >
                            {isLoading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};
