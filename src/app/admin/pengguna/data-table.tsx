/* eslint-disable react-hooks/exhaustive-deps */
// "use client";
import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { SortOrder } from "@/lib/context";
import { useTableStore } from "@/store/table-store";
// import { SortOrder } from "@/lib/context";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  sorting: (sortBy: string, sortOrder: SortOrder) => void;
  onPageSizeChange: (newSize: number) => void;
  onSortingStateChange?: (length: number) => void;
}

export function DataPengguna<TData, TValue>({
  columns,
  data,
  pagination,
  sorting,
  onPageSizeChange,
  // onSortingStateChange
}: DataTableProps<TData, TValue>) {
  const { sorting: sortingState, setSorting } = useTableStore();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination.totalPages,
    onSortingChange: (updater) => {
      // Handle sorting state update
      const newState = typeof updater === 'function' ? updater(sortingState) : updater;
      setSorting(newState);
      
      // Trigger sorting callback
      if (newState.length > 0) {
        const sort = newState[0];
        sorting(sort.id, sort.desc ? "desc" : "asc");
      } else {
        // Jika tidak ada sorting yang aktif
        sorting("", "asc");
      }
    },
    enableSorting: true,
    state: {
      sorting: sortingState,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    getSortedRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto w-full px-4">
      <div className="rounded-md border">
        <Table className="w-full">
          <TableHeader className="text-black text-[13px] font-bold uppercase">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                      <TableHead key={header.id} className="text-black text-[13px] font-bold uppercase">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination 
        table={table} 
        pageSize={pagination.limit} 
        setPageSize={(size) => {
          onPageSizeChange(size);
          sorting("", "asc");
        }}
      />
    </div>
  );
}

