"use client";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FactoryTable } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";
import Form from "./form-edit";

export const columns: ColumnDef<FactoryTable>[] = [
  // {
  //   accessorKey: "user",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Owner"/>
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div>{row.original.user?.username}</div>
  //     );
  //   },
  // },
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => {
      return (
        <Avatar className="w-8 h-8">
          {row.original.logo && (
            <AvatarImage src={row.original.logo} />
          )}
          <AvatarFallback>{row.original.nickname.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "nickname",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Singkat"/>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Pabrik"/>
    ),

  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alamat"/>
    ),

  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal Dibuat"/>
    ),
    cell: ({ row }) => {
      return (
        <div>{new Date(row.original.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status"/>
    ),
    cell: ({ row }) => {
      if (row.original.status === "Active") {
        return <Badge className="bg-blue-500 text-white hover:bg-blue-600">Aktif</Badge>;
      }
      if (row.original.status === "Pending") {
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pending</Badge>;
      }
      if (row.original.status === "Inactive") {
        return <Badge className="bg-red-500 text-white hover:bg-red-600">Tidak Aktif</Badge>;
      }

      return <Badge className="bg-gray-500 text-white hover:bg-gray-600">Tidak Diketahui</Badge>;
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const handleDelete = async (id: number) => {
        try {
          const response = await fetch(`/api/factory?id=${id}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Gagal menghapus data");
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="rounded-md p-2 cursor-pointer">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Form factory={row.original as FactoryTable} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash className="w-4 h-4" />
                  Hapus
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Data akan dihapus
                    secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => handleDelete(row.original.id)}
                    >
                    Ya, Hapus
                  </AlertDialogAction>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

