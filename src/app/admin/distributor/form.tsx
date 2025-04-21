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
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FactoryDistributor } from "@prisma/client";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface DistributorState {
  id?: number;
  name: string;
  factory_id: string;
}

export default function Form({ distributor, factories }: { distributor?: FactoryDistributor, factories: any[] }) {
  const [state, setState] = useState<DistributorState>({
    name: distributor?.name || "",
    factory_id: distributor?.factoryId?.toString() ?? "",
    id: distributor?.id || undefined,
  });

  const createDistributor = async (distributor: DistributorState) => {
    let response;
    if (distributor.id) {
      response = await fetch("/api/distributor/" + distributor.id, {
        method: "PUT",
        body: JSON.stringify(distributor),
      });
    } else {
      response = await fetch("/api/distributor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(distributor),
      });
    }
    const data = await response.json();
    return data;
  };

  const useAddDistributor = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: DistributorState) => createDistributor(data),
      onSuccess: (data: any) => {
        if (data.error) {
          throw new Error(data.error);
        }
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["distributors"] });
        // clear state
        setState({
          name: "",
          factory_id: "",
          id: undefined,
        });
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
    });
  };

  const { mutate } = useAddDistributor();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {distributor ? (
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
            Tambah Distributor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {distributor ? "Edit" : "Tambah"} Distributor
          </DialogTitle>
          <DialogDescription>
            Masukkan nama untuk menambah distributor baru. Klik tombol simpan untuk
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
            <Label htmlFor="name">Nama Distributor</Label>
            <Input
              id="name"
              name="name"
              className="col-span-3"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 py-4">
            <Label htmlFor="price">Pabrik</Label>
            <Select value={state.factory_id} onValueChange={(value) => setState({ ...state, factory_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Pabrik" />
              </SelectTrigger>
              <SelectContent>
                {factories.map((factory) => (
                  <SelectItem key={factory.id} value={factory.id.toString()}>
                    {factory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
