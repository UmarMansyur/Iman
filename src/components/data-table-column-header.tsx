import { Column } from "@tanstack/react-table";
import { Button } from "./ui/button";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDown, Trash } from "lucide-react";
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
          className="h-8 bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
        >
          {title}
          {column.getIsSorted() === "desc" ? (
            <ArrowDownIcon className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUpIcon className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <ArrowUpIcon className="mr-2 h-4 w-4" />
          Naik (ASC)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <ArrowDownIcon className="mr-2 h-4 w-4" />
          Turun (DESC)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.clearSorting()}>
          <Trash className="mr-2 h-4 w-4 text-red-500" />
          <span className="text-red-500">Hapus</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
