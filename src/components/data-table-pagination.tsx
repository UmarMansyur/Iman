"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaginationProps<TData> {
  table: Table<TData>;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export function DataTablePagination<TData>({
  table,
  pageSize,
  setPageSize,
}: PaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex items-center space-x-2">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Menampilkan</span>
              <Button variant="outline" size="sm">
                {pageSize} baris
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[1, 5, 10, 15, 25, 50, 100].map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => {
                  setPageSize(size);
                  table.setPageIndex(0);
                }}
                className={`hover:text-black ${
                  pageSize === size ? "bg-gray-200 text-black hover:bg-gray-200/90 hover:text-black" : ""
                }`}
              >
                {size} baris
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft />
        </Button>
        {(() => {
          const currentPage = table.getState().pagination.pageIndex;
          const totalPages = table.getPageCount();
          const pageNumbers: number[] = [];

          // Selalu tampilkan halaman pertama
          pageNumbers.push(0);

          // Tambahkan halaman sebelum halaman aktif
          if (currentPage > 1) {
            pageNumbers.push(currentPage - 1);
          }

          // Tambahkan halaman aktif
          if (currentPage > 0 && currentPage < totalPages - 1) {
            pageNumbers.push(currentPage);
          }

          // Tambahkan halaman setelah halaman aktif
          if (currentPage < totalPages - 2) {
            pageNumbers.push(currentPage + 1);
          }

          // Selalu tampilkan halaman terakhir
          if (totalPages > 1) {
            pageNumbers.push(totalPages - 1);
          }

          return (
            <>
              {pageNumbers
                .filter((value, index, self) => self.indexOf(value) === index)
                .sort((a, b) => a - b)
                .map((pageIndex, i, array) => (
                  <React.Fragment key={pageIndex}>
                    {i > 0 && array[i] - array[i - 1] > 1 && (
                      <span className="mx-2">...</span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.setPageIndex(pageIndex)}
                      className={`${
                        currentPage === pageIndex
                          ? "bg-primary2 text-white hover:bg-primary2/90 hover:text-white"
                          : ""
                      }`}
                    >
                      {pageIndex + 1}
                    </Button>
                  </React.Fragment>
                ))}
            </>
          );
        })()}
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
