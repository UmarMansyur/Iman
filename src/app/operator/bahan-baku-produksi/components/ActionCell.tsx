/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "@/components/delete-button";
import EditMaterialStockReport from "../editForm";

interface ActionCellProps {
  row: any;
  fetchData: () => Promise<void>;
}

export function ActionCell({ row, fetchData }: ActionCellProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className="rounded-md p-2 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditMaterialStockReport data={row.original} fetchData={fetchData} />

        <DeleteButton
          id={row.original.id}
          fetchData={fetchData}
          endpoint="/material-stock/production"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
