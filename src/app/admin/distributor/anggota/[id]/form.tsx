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
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface UserState {
  distributor_id?: number;
  user_id: number;
  role: string;
}

export default function Form({ 
  user, 
  distributorId, 
  id, 
  users 
}: { 
  user?: any; 
  distributorId: number | null; 
  users: any[];
  id?: number;
}) {
  const [state, setState] = useState<UserState>({
    distributor_id: id || undefined,
    user_id: user?.id || 0,
    role: user?.role || "",
  });

  const [open, setOpen] = useState(false);

  const createUser = async (user: UserState) => {
    let response;

    if (id) {
      response = await fetch(`/api/distributor/${distributorId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distributor_id: id,
          user_id: user.user_id,
          role: user.role,
        }),
      });
    } else {
      response = await fetch(`/api/distributor/${distributorId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.user_id,
          role: user.role,
        }),
      });
    }
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.message);
    } else {
      toast.success(data.message);
    }
    return data;
  };

  const useAddUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: UserState) => createUser(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["member-distributor"] });
        setState({
          distributor_id: undefined,
          user_id: 0,
          role: "",
        });
        setOpen(false);
      },
    });
  };

  const { mutate } = useAddUser();

  const availableRoles = ["Distributor", "Owner Distributor"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {user ? (
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
            Tambah User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {id ? "Edit" : "Tambah"} User
          </DialogTitle>
          <DialogDescription>
            Pilih user dan role. Klik tombol simpan untuk menyimpan data.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutate(state);
          }}
        >
          <div className="grid gap-4 py-4">
            <Label htmlFor="user">User</Label>
            <Select onValueChange={(value) => setState({ ...state, user_id: Number(value) })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih User" />
              </SelectTrigger>
              <SelectContent>
                {
                  !users || users.length === 0 ? (
                    <SelectItem key={0} value={"0"}>
                      Tidak ada user
                    </SelectItem>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))
                  )
                }
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 py-4">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => setState({ ...state, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="bg-white hover:bg-gray-100 border border-gray-300"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}