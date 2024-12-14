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
import { Check, Loader2, Save } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import toast from "react-hot-toast";

interface ActionCellProps {
  row: any;
  fetchData: () => Promise<void>;
}

export function ActionCell({ row, fetchData }: ActionCellProps) {
  const [status, setStatus] = useState(row.original.status);
  const [save, setSave] = useState(false);

  const handleSave = async () => {
    setSave(true);
    try {
      const response = await fetch(`/api/order/status/${row.original.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      await fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
    setSave(false);
  }

  return (
    <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="justify-start bg-primary2 text-white hover:bg-primary2/80 hover:shadow-primary2/60 hover:text-white" disabled={status === "Approved" || status === "Rejected"}>
              <Check className="w-4 h-4" /> Validasi
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
                    <SelectItem value="Rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="default"
                onClick={handleSave}
                disabled={save}
              >
                {save ? <Loader2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {save ? 'Menyimpan...' : 'Simpan'}
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Tutup</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
} 