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
import { useTableStore } from "@/store/table-store";
import EmptyData from "@/components/views/empty-data";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  sorting: (sortBy: string, sortOrder: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  sorting,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [pageSize, setPageSize] = React.useState(pagination.limit);
  const { sorting: sortingState, setSorting } = useTableStore();
  
  const table = useReactTable({
    data,
    columns,
    pageCount: pagination.totalPages,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: pagination.page - 1,
          pageSize: pageSize,
        });
        onPageChange(newState.pageIndex);
      }
    },
    onSortingChange: (updater) => {
      const newState = typeof updater === 'function' ? updater(sortingState) : updater;
      setSorting(newState);
      if (newState.length > 0) {
        const sort = newState[0];
        sorting(sort.id, sort.desc ? "desc" : "asc");
      } else {
        sorting("", "asc");
      }
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto w-full">
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
                  colSpan={7}
                  className="h-24 text-center"
                >
                  <EmptyData text="Tidak ada data Stok Bahan Baku. Silahkan entry data Stok Bahan Baku Terlebih Dahulu!" />
                  <Link href="/operator/persediaan-bahan-baku/entry">
                    <Button variant="outline" size="sm" className="mt-2 bg-primary2 text-white border-none shadow-primary2/50 shadow-sm hover:bg-primary2/80 hover:shadow-primary2/60 hover:text-white">
                    <PlusCircleIcon className="w-4 h-4" />
                    Entry Stock Bahan Baku
                  </Button>
                  </Link>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination 
        table={table}
        pageSize={pageSize}
        setPageSize={(size) => {
          setPageSize(size);
          onPageSizeChange(size);
        }}
      />
    </div>
  );
}

