/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteButton from "@/components/delete-button";

interface ActionCellProps {
  row: any;
  fetchData: () => Promise<void>;
}

export function ActionCell({ row, fetchData }: ActionCellProps) {
  const [status, setStatus] = useState(row.original.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="rounded-md p-2 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              disabled={status === "Approved" || status === "Rejected"}
            >
              <Check className="w-4 h-4" /> Validasi Status Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ubah Status Order</DialogTitle>
              <DialogDescription>
                Pilih status baru untuk order ini
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  defaultValue={status}
                  onValueChange={(value) => setStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Menunggu</SelectItem>
                    <SelectItem value="Approved">Diterima</SelectItem>
                    <SelectItem value="Rejected">Batal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="default"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `/api/order/status/${row.original.id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          status: status,
                        }),
                      }
                    );

                    if (!response.ok) {
                      throw new Error("Gagal mengupdate status");
                    }

                    await fetchData();
                  } catch (error) {
                    console.error("Error updating status:", error);
                  }
                }}
              >
                Simpan
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Tutup</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          disabled={status === "Approved" || status === "Rejected"}
          onClick={() => {
            window.location.href = `/owner/persediaan-bahan-baku/order/${row.original.id}`;
          }}
        >
          <Pencil className="w-4 h-4" /> Ubah Detail Order
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
