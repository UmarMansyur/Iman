"use client";

import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
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
import Link from "next/link";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
// email         String    @unique
// username      String    @unique
// password      String
// gender        Gender
// tanggal_lahir DateTime
// thumbnail     String?
// address       String
export type User = {
  id: number;
  email: string;
  username: string;
  gender: "Male" | "Female";
  date_of_birth: string;
  thumbnail: string | null;
  address: string;
  user_type: "Operator" | "Administrator";
  is_active: boolean;
  is_verified: boolean;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "thumbnail",
    header: "Foto Profil",
    cell: ({ row }) => {
      const username: string = row.getValue("username");
      const initial = username.charAt(0).toUpperCase();
      return (
        <Avatar>
          {row.original.thumbnail && (
            <AvatarImage src={row.original.thumbnail} />
          )}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jenis Kelamin" />
    ),
    cell: ({ row }) => {
      return row.original.gender === "Male" ? "Laki-laki" : "Perempuan";
    },
  },
  {
    accessorKey: "date_of_birth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal Lahir" />
    ),
    cell: ({ row }) => {
      return new Date(row.getValue("date_of_birth")).toLocaleDateString(
        "id-ID"
      );
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Alamat" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      const isVerified = row.original.is_verified;

      if (!isVerified)
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            Belum Verifikasi
          </Badge>
        );
      if (isActive)
        return <Badge className="bg-blue-500 hover:bg-blue-600">Aktif</Badge>;
      return <Badge className="bg-red-500 hover:bg-red-600">Tidak Aktif</Badge>;
    },
  },
  {
    accessorKey: "action",
    header: "Aksi",
    cell: ({ row }) => {
      const handleDelete = async (id: number) => {
        try {
          const response = await fetch(`/api/user?id=${id}`, {
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
            <DropdownMenuItem asChild>
              <Link href={`/admin/pengguna/update/${row.original.id}`}>
                <Pencil className="w-4 h-4" />
                Edit
              </Link>
            </DropdownMenuItem>
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
