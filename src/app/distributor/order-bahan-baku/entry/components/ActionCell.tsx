/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteButton from "@/components/delete-button";
import { MoreHorizontal, Pencil } from "lucide-react";

interface ActionCellProps {
  row: any;
  fetchData: () => Promise<void>;
}

export function ActionCell({ row, fetchData }: ActionCellProps) {
  const router = useRouter();

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
          onClick={() => {
            router.push(`/distributor/order-bahan-baku/entry/${row.original.id}`);
          }}
        >
          <Pencil className="w-4 h-4 mr-1" /> Edit
        </Button>

        <DeleteButton
          id={row.original.id}
          fetchData={fetchData}
          endpoint="/distributor/order-bahan-baku"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
