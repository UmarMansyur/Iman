/* eslint-disable react-hooks/exhaustive-deps */
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
  DropdownUser,
} from "@/lib/definitions";
import { Check, ChevronsUpDown, Pencil, PlusCircle } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/user-store";
import { Role } from "@prisma/client";
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
import SelectUser from "@/components/views/select-user";

// firut invite member itu ada no, nama pengguna -> kembalikan email foto dan nama pengguna , role, status
// data ini berarti user_email, role_id
type FormProps = {
  operator?: { 
    options: DropdownUser[];
    choiced: (value: DropdownUser) => void;
    searchData: (query: string) => Promise<void>;
    keyword: string;
  };
  fetchData: () => Promise<void>;
  roleData?: Role[];
  data?: {
    id: string;
    user_id: string;
    role_id: string;
  };
};

export default function Form({ operator, fetchData, data, roleData }: FormProps) {
  const [user, setUser] = useState<DropdownUser | null>(null);
  const [role, setRole] = useState<DropdownOptions | null>(
    data?.role_id ? {
      value: operator?.options.find(option => option.value === data.user_id)?.value || "",
      label:  data.role_id || "Pilih Role...",
    } : null
  );

  const [roleOpen, setRoleOpen] = useState(false);
  
  const { user: sessionUser } = useUserStore();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('id', data?.id || '');
    formData.set('user_id', user?.value || '');
    formData.set('role_id', role?.value || '');
    formData.set('factory_id', sessionUser?.factory_selected?.id || '');

    const response:any = await fetch('/api/operator', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();


    // if(!data) {
    //   const formData2 = new FormData();
    //   formData2.set('senderName', sessionUser?.username || '');
    //   formData2.set('email', user?.email || '');
    //   formData2.set('name', user?.label || '');
    //   formData2.set('id', result.data.id || '');
    //   await fetch('/api/send', {
    //     method: 'POST',
    //     body: formData2
    //   });
    // }
    if (result.error) {
      toast.error(result.error);
    } else {

     

      toast.success(result.message);
    }

    await fetchData();
  };

  useEffect(() => {
    if (data && operator) {
      const user_id = operator?.options.find(option => option.value === data.user_id)?.value;
      setUser({
        value: user_id || "",
        label: operator?.options.find(option => option.value === data.user_id)?.label || "",
        thumbnail: operator?.options.find(option => option.value === data.user_id)?.thumbnail || "",
        email: operator?.options.find(option => option.value === data.user_id)?.email || "",
      });
    }
  }, [data]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {data ? (
          <Button variant="ghost" className="w-full flex justify-start px-2">
            <Pencil className="w-4 h-4 mr-1" />
            Edit Operator
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="bg-blue-500 hover:bg-blue-600 flex justify-end px-4 text-white hover:text-white"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Operator
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
              <SelectUser
                title="Nama Operator"
                placeholder="Pilih Nama Operator"
                notFound="Tidak ada data yang ditemukan..."
                options={operator?.options || []}
                searchData={operator?.searchData || (async () => {})}
                choiced={setUser}
                onSearch={(value) => {
                  operator?.searchData(value);
                }}
                defaultValue={user}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit">Role</Label>
              <Popover open={roleOpen} onOpenChange={setRoleOpen} modal={true} defaultOpen={true}>
                <PopoverTrigger asChild className="col-span-3" name="role_id">
                  <Button
                    variant="ghost"
                    role="combobox"
                    className="justify-between col-span-3 bg-white border border-gray-300 text-black"
                  >
                    {role?.label || operator?.options.find(option => option.value === data?.user_id)?.label || "Pilih Role..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 justify-between">
                  <Command>
                    <CommandInput placeholder="Search role..." />
                    <CommandList>
                      <CommandEmpty>
                        Tidak ada role yang ditemukan.
                      </CommandEmpty>
                      <CommandGroup>
                        <ScrollArea className="h-[200px] overflow-y-auto">
                          {roleData?.map((item: Role) => (
                            <CommandItem
                              key={item.id}
                              value={item.role.toString()}
                              onSelect={() => {
                                setRole({
                                  value: item.id.toString(),
                                  label: item.role,
                                });
                                setRoleOpen(false);
                              }}
                            >
                              {item.role}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  role?.value === item.id.toString()
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
