import React from "react";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T, idx: number) => React.ReactNode;
  className?: string;
};

export default function DataTable<T>({
  data,
  columns,
  actions,
}: {
  data: T[];
  columns: Column<T>[];
  actions?: (row: T) => React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 text-left text-sm text-gray-600">
          <tr>
            <th className="px-4 py-3 w-12">#</th>
            {columns.map((c) => (
              <th key={String(c.key)} className={`px-4 py-3 ${c.className || ""}`}>{c.header}</th>
            ))}
            {actions && <th className="px-4 py-3 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row: any, i) => (
            <tr key={row.id ?? i} className="text-sm">
              <td className="px-4 py-3">{i + 1}</td>
              {columns.map((c) => (
                <td key={String(c.key)} className={`px-4 py-3 ${c.className || ""}`}>
                  {c.render ? c.render(row, i) : String(row[c.key as keyof T] ?? "—")}
                </td>
              ))}
              {actions && <td className="px-4 py-3"><div className="flex justify-end gap-2">{actions(row)}</div></td>}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 2 : 1)} className="px-4 py-8 text-center text-gray-500">
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
