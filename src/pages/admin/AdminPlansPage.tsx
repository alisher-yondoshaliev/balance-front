/**
 * Admin Plans Management Page
 * CRUD operations for subscription plans (SUPERADMIN only)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader, Plus } from 'lucide-react';
import {
    useGetPlans,
    useCreatePlan,
    useUpdatePlan,
    useDeletePlan,
} from '../../hooks/useSubscriptions';
import { PlanModal } from '../../components/subscriptions/PlanModal';
import { PlanCard } from '../../components/subscriptions/PlanCard';
import { useAuthStore } from '../../store/auth.store';
import type { SubscriptionPlan, CreatePlanInput } from '../../types/subscription.types';

export const AdminPlansPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Check authorization
    React.useEffect(() => {
        if (user?.role !== 'SUPERADMIN') {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    // Queries & Mutations
    const plansQuery = useGetPlans();
    const createMutation = useCreatePlan();
    const updateMutation = useUpdatePlan();
    const deleteMutation = useDeletePlan();

    // Handle modal open/close
    const handleOpenModal = (plan?: SubscriptionPlan) => {
        setEditingPlan(plan || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    // Handle form submission
    const handleFormSubmit = async (data: CreatePlanInput) => {
        try {
            // Convert features string to array if needed
            const formattedData = {
                ...data,
                features: typeof data.features === 'string'
                    ? (data.features as string)
                        .split(',')
                        .map((f: string) => f.trim())
                        .filter(Boolean)
                    : data.features,
            };

            if (editingPlan) {
                await updateMutation.mutateAsync({
                    id: editingPlan.id,
                    input: formattedData,
                });
            } else {
                await createMutation.mutateAsync(formattedData);
            }

            handleCloseModal();
        } catch (err) {
            console.error('Form submission error:', err);
        }
    };

    // Handle delete
    const handleDelete = async (planId: string) => {
        try {
            await deleteMutation.mutateAsync(planId);
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    if (plansQuery.isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin mx-auto mb-4" size={32} />
                    <p className="text-gray-600 font-medium">Loading plans...</p>
                </div>
            </div>
        );
    }

    if (plansQuery.isError) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 flex items-center gap-4">
                        <AlertCircle className="text-red-600 flex-shrink-0" size={32} />
                        <div>
                            <h2 className="text-lg font-bold text-red-900">Error Loading Plans</h2>
                            <p className="text-red-800 mt-1">
                                Failed to load plans. Please try again.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Manage Plans
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Create, edit, and delete subscription plans
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                        New Plan
                    </button>
                </div>

                {/* Error Alerts */}
                {createMutation.isError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-medium">
                            Failed to create plan. Please try again.
                        </p>
                    </div>
                )}

                {updateMutation.isError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-medium">
                            Failed to update plan. Please try again.
                        </p>
                    </div>
                )}

                {deleteMutation.isError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-medium">
                            Failed to delete plan. Please try again.
                        </p>
                    </div>
                )}

                {/* Plans Grid */}
                {plansQuery.data && plansQuery.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plansQuery.data.map((plan) => (
                            <div key={plan.id} className="relative">
                                <PlanCard
                                    plan={plan}
                                    showActions={true}
                                    onEdit={() => handleOpenModal(plan)}
                                    onDelete={() => setShowDeleteConfirm(plan.id)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <AlertCircle className="mx-auto text-gray-400 mb-3" size={32} />
                        <p className="text-gray-600 font-medium mb-4">No plans yet</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            Create Your First Plan
                        </button>
                    </div>
                )}

                {/* Modal */}
                <PlanModal
                    isOpen={isModalOpen}
                    plan={editingPlan}
                    onClose={handleCloseModal}
                    onSubmit={handleFormSubmit}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                    error={createMutation.error?.message || updateMutation.error?.message || null}
                />

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowDeleteConfirm(null)}
                        />
                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 z-50">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Delete Plan
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this plan? This action cannot
                                be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
                                >
                                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
