import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  hideOnMobile?: boolean;
  mobileLabel?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  mobileCardRender?: (item: T) => ReactNode;
}

function Table<T extends { id: string }>({ 
  data, 
  columns, 
  onRowClick, 
  emptyMessage = 'No data available',
  mobileCardRender 
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="card text-center py-8 sm:py-12">
        <p className="text-gray-500 text-sm sm:text-base">{emptyMessage}</p>
      </div>
    );
  }

  // Mobile card view
  const renderMobileCards = () => (
    <div className="space-y-3 sm:hidden">
      {data.map((item) => (
        <div
          key={item.id}
          onClick={() => onRowClick?.(item)}
          className={`card p-4 ${onRowClick ? 'cursor-pointer active:bg-gray-50' : ''}`}
        >
          {mobileCardRender ? (
            mobileCardRender(item)
          ) : (
            <div className="space-y-2">
              {columns.filter(col => !col.hideOnMobile).map((column, idx) => (
                <div key={column.key} className={idx === 0 ? '' : 'flex justify-between items-center'}>
                  {idx === 0 ? (
                    <div className="font-medium text-gray-900 mb-2">
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </div>
                  ) : (
                    <>
                      <span className="text-xs text-gray-500">{column.mobileLabel || column.header}</span>
                      <span className="text-sm text-gray-900">
                        {column.render ? column.render(item) : (item as any)[column.key]}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Desktop table view
  const renderDesktopTable = () => (
    <div className="hidden sm:block card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={column.key}
                className="text-left py-3 px-4 text-sm font-semibold text-gray-700 whitespace-nowrap"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`border-b border-gray-100 hover:bg-gray-50 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((column) => (
                <td key={column.key} className="py-3 px-4 text-sm text-gray-900">
                  {column.render
                    ? column.render(item)
                    : (item as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {renderMobileCards()}
      {renderDesktopTable()}
    </>
  );
}

export default Table;

