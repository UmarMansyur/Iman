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
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
  DropdownOptions,
  MaterialUnit,
  MaterialUnitFormState,
  Operator,
} from "@/lib/definitions";
import { Check, ChevronsUpDown, Pencil, PlusCircle } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import createMaterialUnit from "@/app/actions/material-unit";
import { Material, MemberFactoryStatus, Unit } from "@prisma/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SelectOption, {
  SelectDebounceProps,
} from "@/components/views/select-option";

// firut invite member itu ada no, nama pengguna -> kembalikan email foto dan nama pengguna , role, status
// data ini berarti user_email, role_id
type FormProps = {
  operator?: { 
    options: DropdownOptions[];
    choiced: (value: DropdownOptions) => void;
    searchData: (query: string) => Promise<void>;
    keyword: string;
  };
  fetchData: () => Promise<void>;
  data?: {
    user_email: string;
    role_id: MemberFactoryStatus
  };
};

export default function Form({ operator, fetchData, data }: FormProps) {
  const [user, setUser] = useState<DropdownOptions | null>(null);
  const [role, setRole] = useState<DropdownOptions | null>(null);

  const [roleOpen, setRoleOpen] = useState(false);
  
  const roles = [
    { id: 1, label: "Owner" },
    { id: 2, label: "Operator" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetchData();
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        {data ? (
          <Button variant="ghost" className="w-full flex justify-start px-2">
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="bg-blue-500 hover:bg-blue-600 flex justify-end px-4 text-white hover:text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
       <DialogHeader>
          <DialogTitle>
            {operator ? "Edit Operator" : "Tambah Operator"}
          </DialogTitle>
          <DialogDescription>
            Masukkan nama baru untuk{" "}
            {operator
              ? "mengubah operator"
              : "menambah operator"}
            . Klik tombol simpan untuk menyimpan{" "}
            {operator ? "perubahan" : "operator"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material">Nama Operator</Label>
              <SelectOption
                keyword={operator?.keyword || ""}
                title="Nama Operator"
                placeholder="Pilih Nama Operator"
                notFound="Tidak ada data yang ditemukan..."
                options={operator?.options || []}
                searchData={operator?.searchData || (async () => {})}
                choiced={setUser}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit">Role</Label>
              <Popover open={roleOpen} onOpenChange={setRoleOpen}>
                <PopoverTrigger asChild className="col-span-3" name="role_id">
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="justify-between col-span-3 bg-white border border-gray-300 text-black"
                  >
                    {role?.label|| "Pilih Role..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 justify-between">
                  <Command>
                    <CommandInput placeholder="Search bahan baku..." />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada bahan baku yang ditemukan.
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px]">
                          {roles.map((role: { id: number; label: string }) => (
                            <CommandItem
                              key={role.id}
                              value={role.id.toString()}
                              onSelect={() => {
                                setRole({
                                  value: role.id.toString(),
                                  label: role.label,
                                });
                                setRoleOpen(false);
                              }}
                            >
                              {role.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  role?.id === role.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

            </div>
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
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
