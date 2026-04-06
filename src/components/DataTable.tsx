import React from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { InboxIcon } from 'lucide-react';
export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
}
export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Nenhum registro encontrado.',
  keyExtractor
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-border text-text-secondary font-medium">
            <tr>
              {columns.map((col, i) =>
              <th key={i} className={`px-6 py-3 ${col.className || ''}`}>
                  {col.header}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((row) =>
            <tr key={row} className="border-b border-border last:border-0">
                {columns.map((col, i) =>
              <td key={i} className={`px-6 py-4 ${col.className || ''}`}>
                    <Skeleton
                  height="1.25rem"
                  width={i === 0 ? '60%' : '100%'} />
                
                  </td>
              )}
              </tr>
            )}
          </tbody>
        </table>
      </div>);

  }
  if (data.length === 0) {
    return (
      <div className="border border-border rounded-xl bg-surface">
        <EmptyState
          icon={<InboxIcon className="w-8 h-8" />}
          title="Sem dados"
          description={emptyMessage} />
        
      </div>);

  }
  return (
    <div className="w-full overflow-x-auto border border-border rounded-xl bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-border text-text-secondary font-medium">
          <tr>
            {columns.map((col, i) =>
            <th key={i} className={`px-6 py-3 ${col.className || ''}`}>
                {col.header}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item) =>
          <tr
            key={keyExtractor(item)}
            className="hover:bg-gray-50 transition-colors">
            
              {columns.map((col, i) =>
            <td
              key={i}
              className={`px-6 py-4 text-text-primary ${col.className || ''}`}>
              
                  {col.cell ?
              col.cell(item) :
              col.accessorKey ?
              String(item[col.accessorKey]) :
              null}
                </td>
            )}
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}