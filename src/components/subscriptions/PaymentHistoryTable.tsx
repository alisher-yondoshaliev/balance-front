import { AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import type { SubscriptionHistory } from '../../api/endpoints/subscriptions.api';

interface PaymentHistoryTableProps {
    history: SubscriptionHistory[];
    isLoading?: boolean;
}

// Status badge styling
function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Faol' },
        inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Nofaol' },
        expired: { bg: 'bg-red-100', text: 'text-red-800', label: 'Muddati tugagan' },
        cancelled: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Bekor qilingan' },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.inactive;

    return (
        <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
        >
            {config.label}
        </span>
    );
}

// Table row skeleton loader
function TableRowSkeleton() {
    return (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
            </td>
            <td className="px-6 py-4">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
            </td>
        </tr>
    );
}

export function PaymentHistoryTable({
    history,
    isLoading = false,
}: PaymentHistoryTableProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Tarif nomi
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                To'lov sanasi
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Summa
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Muddati
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <TableRowSkeleton key={i} />
                                ))}
                            </>
                        ) : history && history.length > 0 ? (
                            history.map((payment) => {
                                const paymentDate = dayjs(payment.paymentDate);
                                const startDate = dayjs(payment.startDate);
                                const endDate = dayjs(payment.endDate);
                                const duration = endDate.diff(startDate, 'day');

                                return (
                                    <tr
                                        key={payment.id}
                                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        {/* Plan Name */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {payment.plan?.name || 'Noma\'lum'}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    ID: {payment.id}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Payment Date */}
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">
                                                {paymentDate.format('DD.MM.YYYY')}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {paymentDate.format('HH:mm')}
                                            </p>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-lg text-gray-900">
                                                {payment.amount.toLocaleString('uz-UZ')}
                                            </p>
                                            <p className="text-sm text-gray-500">so'm</p>
                                        </td>

                                        {/* Duration */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {startDate.format('DD.MM')} - {endDate.format('DD.MM')}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {duration} kun
                                                </p>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={payment.status} />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <AlertCircle size={32} className="mb-3 opacity-50" />
                                        <p className="font-medium">To'lov tarixi mavjud emas</p>
                                        <p className="text-sm mt-1">
                                            Hozircha hech qanday to'lov mavjud emas
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            {history && history.length > 0 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Jami: <span className="font-semibold">{history.length}</span> ta to'lov
                    </p>
                </div>
            )}
        </div>
    );
}
