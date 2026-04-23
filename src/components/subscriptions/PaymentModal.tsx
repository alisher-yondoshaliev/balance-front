import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import type { SubscriptionPlan, PaymentInput } from '../../api/endpoints/subscriptions.api';

interface PaymentModalProps {
    plan: SubscriptionPlan | null;
    isOpen: boolean;
    isLoading?: boolean;
    error?: string | null;
    onClose: () => void;
    onSubmit: (data: PaymentInput) => Promise<void>;
}

type PaymentFormData = {
    paymentMethod: string;
};

export function PaymentModal({
    plan,
    isOpen,
    isLoading = false,
    error = null,
    onClose,
    onSubmit,
}: PaymentModalProps) {
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { control, handleSubmit, reset, formState: { errors } } = useForm<PaymentFormData>({
        defaultValues: {
            paymentMethod: 'card',
        },
    });

    if (!isOpen || !plan) return null;

    const handleFormSubmit = async (data: PaymentFormData) => {
        try {
            await onSubmit({
                planId: plan.id,
                paymentMethod: data.paymentMethod,
            });
            setSuccess(true);
            setSuccessMessage('✓ To\'lov muvaffaqiyatli qabul qilindi!');
            setTimeout(() => {
                setSuccess(false);
                setSuccessMessage('');
                reset();
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Payment error:', err);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">To'lov qilish</h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        // Success State
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                                    <CheckCircle className="relative text-green-500" size={48} />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-green-600 mb-2">
                                Tabriklaymiz!
                            </h3>
                            <p className="text-gray-600">{successMessage}</p>
                        </div>
                    ) : (
                        // Form State
                        <>
                            {/* Plan info summary */}
                            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                        {plan.description && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                {plan.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="border-t border-blue-200 pt-3 mt-3">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-gray-700 font-medium">Narxi:</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-blue-600">
                                                {plan.price.toLocaleString('uz-UZ')}
                                            </span>
                                            <span className="text-gray-600">so'm</span>
                                        </div>
                                    </div>
                                    {plan.duration && (
                                        <p className="text-xs text-gray-600 mt-2">
                                            {plan.duration} kun uchun
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200 flex items-start gap-3">
                                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-red-800 mb-1">
                                            Xato yuz berdi
                                        </p>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Payment method form */}
                            <form onSubmit={handleSubmit(handleFormSubmit)}>
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        To'lov usuli
                                    </label>
                                    <Controller
                                        name="paymentMethod"
                                        control={control}
                                        rules={{ required: 'To\'lov usulini tanlang' }}
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                {['card', 'mobile', 'bank_transfer'].map((method) => {
                                                    const methodLabels: Record<string, string> = {
                                                        card: '💳 Kredit kartasi',
                                                        mobile: '📱 Mobil to\'lov',
                                                        bank_transfer: '🏦 Bank o\'tkazmasi',
                                                    };

                                                    return (
                                                        <label
                                                            key={method}
                                                            className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50"
                                                            style={{
                                                                borderColor: field.value === method ? '#3b82f6' : '#e5e7eb',
                                                                backgroundColor: field.value === method ? '#eff6ff' : 'transparent',
                                                            }}
                                                        >
                                                            <input
                                                                type="radio"
                                                                value={method}
                                                                checked={field.value === method}
                                                                onChange={(e) => field.onChange(e.target.value)}
                                                                className="w-4 h-4 accent-blue-500"
                                                            />
                                                            <span className="ml-3 font-medium text-gray-700">
                                                                {methodLabels[method]}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    />
                                    {errors.paymentMethod && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle size={14} />
                                            {errors.paymentMethod.message}
                                        </p>
                                    )}
                                </div>

                                {/* Warning message */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
                                    <p className="font-medium mb-1">⚠️ Eslatma:</p>
                                    <p>To'lov qabul qilingandan so'ng obuna avtomatik faollashtiriladi.</p>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 text-gray-700 font-semibold border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Jarayonda...
                                            </>
                                        ) : (
                                            <>
                                                💳 To'lovni amalga oshirish
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
