import type { ReactNode } from 'react';
import { TableRowSkeleton } from './Skeleton';

export interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, isLoading, keyExtractor, emptyMessage = 'No data found.' }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} columns={columns.length} />)}
          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!isLoading &&
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="border-b border-slate-100 dark:border-slate-800 last:border-0 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-4 align-middle ${col.className ?? ''}`}>
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
