/**
 * DataTable Component
 * Generic reusable table with pagination and sorting
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T extends { id: string }> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    rowClassName?: string;
}

export function DataTable<T extends { id: string }>({
    columns,
    data,
    isLoading = false,
    emptyMessage = 'No data available',
    onRowClick,
    rowClassName,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="animate-pulse p-6 space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
                <div className="flex items-center justify-center text-center">
                    <div>
                        <AlertCircle className="mx-auto text-gray-400 mb-3" size={32} />
                        <p className="text-gray-600 font-medium">{emptyMessage}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    {/* Header */}
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide ${column.className || ''
                                        }`}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {data.map((row) => (
                            <tr
                                key={row.id}
                                onClick={() => onRowClick?.(row)}
                                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''
                                    } ${rowClassName || ''}`}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={String(column.key)}
                                        className={`px-6 py-4 text-sm text-gray-900 ${column.className || ''}`}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : String(row[column.key] || '-')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{data.length}</span> of{' '}
                    <span className="font-semibold">{data.length}</span> entries
                </p>
            </div>
        </div>
    );
}
