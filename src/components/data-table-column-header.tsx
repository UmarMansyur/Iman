import { Column } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { ChevronDown, ChevronsUpDown, ChevronUp, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";


export function DataTableColumnHeader({
  column,
  title,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<any, unknown>;
  title: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="flex items-center justify-start">
        <Button 
          variant="ghost" 
          className="h-8 text-black bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-[13px] font-bold"
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
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <ChevronUp className="mr-2 h-4 w-4" />
          Naik (ASC)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <ChevronDown className="mr-2 h-4 w-4" />
          Turun (DESC)
        </DropdownMenuItem>
        {
          (column.getIsSorted() === "desc" || column.getIsSorted() === "asc") && (
            <DropdownMenuItem onClick={() => column.clearSorting()}>
              <Trash className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-red-500">Hapus</span>
            </DropdownMenuItem>
          )
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
