/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";


import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import DeleteButton from "@/components/delete-button";

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
      <DropdownMenuContent align="end" className="w-52">
        

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          disabled={status === "Approved" || status === "Rejected"}
          onClick={() => {
            window.location.href = `/owner/persediaan-bahan-baku/order/${row.original.id}`;
          }}
        >
          <Pencil className="w-4 h-4 mr-1" /> Ubah Detail Order
        </Button>

        <DeleteButton
          id={row.original.id}
          fetchData={fetchData}
          endpoint="/order"
          disabled={status === "Approved" || status === "Rejected"}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
