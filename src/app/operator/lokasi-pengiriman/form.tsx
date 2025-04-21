/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { Location } from "@prisma/client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatCurrencyInput } from "@/lib/number";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user-store";
import toast from "react-hot-toast";

interface LocationFormState {
  id?: number;
  name: string;
  cost: number;
  factory_id: string;
}

export default function Form({ location }: { location?: Location }) {
  const { user } = useUserStore();

  const [state, setState] = useState<LocationFormState>({
    name: location?.name || "",
    cost: location?.cost || 0,
    factory_id: location?.factory_id.toString() || "",
    id: location?.id || undefined,
  });

  const createLocation = async (location: LocationFormState) => {
    location.factory_id = user?.factory_selected?.id.toString() || "";
    let response;

    if (location.id) {
      response = await fetch("/api/location/" + location.id, {
        method: "PUT",
        body: JSON.stringify(location),
      });
    } else {
      response = await fetch("/api/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(location),
      });
    }
    const data = await response.json();
    return data;
  };

  const useAddLocation = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: LocationFormState) => createLocation(data),
      onSuccess: (data: any) => {
        if (data.error) {
          throw new Error(data.error);
        }
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["locations"] });
        // clear state
        setState({
          name: "",
          cost: 0,
          factory_id: "",
          id: undefined,
        });
      },
      onError: (error: any) => {
        console.log(error);
        toast.error(error.message);
      },
    });
  };

  const { mutate } = useAddLocation();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {location ? (
          <Button variant="ghost" className="w-full flex justify-start px-2">
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="bg-blue-500 hover:bg-blue-600 flex justify-end px-4 text-white hover:text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Produk
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Satuan</DialogTitle>
          <DialogDescription>
            Masukkan nama untuk menambah satuan baru. Klik tombol simpan untuk
            menyimpan data.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutate(state);
          }}
        >
          <div className="grid gap-4 py-4">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              name="name"
              className="col-span-3"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 py-4">
            <Label htmlFor="cost">Biaya</Label>
            <Input
              id="cost"
              name="cost"
              className="col-span-3"
              value={formatCurrency(state.cost)}
              onChange={(e) =>
                setState({ ...state, cost: formatCurrencyInput(e) })
              }
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="bg-white hover:bg-gray-100 border border-gray-300"
              >
                Batal
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Simpan
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
