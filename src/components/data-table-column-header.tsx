/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { ChevronDown, ChevronsUpDown, ChevronUp, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTableStore } from "@/store/table-store";

export function DataTableColumnHeader({
  column,
  title,
}: {
  column: Column<any, any>;
  title: string;
}) {
  const { setSorting } = useTableStore();
  const handleSort = (desc: boolean | undefined) => {
    const currentSort = column.getIsSorted();
    
    if (desc === undefined) {
      column.clearSorting();
      setSorting([]);
      return;
    }

    // Jika sudah ASC dan klik ASC lagi, tetap di ASC
    if (currentSort === "asc" && !desc) {
      return;
    }

    // Jika sudah DESC dan klik DESC lagi, tetap di DESC
    if (currentSort === "desc" && desc) {
      return;
    }

    column.toggleSorting(desc);
    setSorting([{
      id: column.id,
      desc: desc
    }]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="flex items-center">
        <Button 
          variant="ghost" 
          className="h-8 text-black bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-[13px] font-bold"
          onClick={() => {
            const currentSort = column.getIsSorted();
            if (!currentSort) handleSort(false); // ke ASC
            else if (currentSort === "asc") handleSort(true); // ke DESC
            else handleSort(false); // kembali ke ASC
          }}
        >
          <span className="text-black uppercase">{title}</span>
          {column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4 text-black" />
          ) : column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4 text-black" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 text-black" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem 
          onClick={() => handleSort(false)}
          className={column.getIsSorted() === "asc" ? "bg-accent" : ""}
        >
          <ChevronUp className="mr-2 h-4 w-4" />
          Naik (ASC)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSort(true)}
          className={column.getIsSorted() === "desc" ? "bg-accent" : ""}
        >
          <ChevronDown className="mr-2 h-4 w-4" />
          Turun (DESC)
        </DropdownMenuItem>
        {(column.getIsSorted() === "desc" || column.getIsSorted() === "asc") && (
          <DropdownMenuItem onClick={() => handleSort(undefined)}>
            <Trash className="mr-2 h-4 w-4 text-red-500" />
            <span className="text-red-500">Hapus</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
