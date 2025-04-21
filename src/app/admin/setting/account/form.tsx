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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";

export default function Form({
  data,
  fetchData,
}: {
  data?: any;
  fetchData: () => Promise<void>;
}) {

  const [username, setUsername] = useState(data?.username);
  const [email, setEmail] = useState(data?.email);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("id", data?.id?.toString() || "");
    formData.append("username", username || "");
    formData.append("email", email || "");
    formData.append("password", password || "");

    // if password is empty, remove it from formData
    if (password === "") {
      formData.delete("password");
    }

    if(password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }

    const response = await fetch('/api/user', {
      method: 'PATCH',
      body: formData
    })

    const responseData = await response.json();

    if (response.ok) {
      toast.success("Akun berhasil diubah");
      await fetchData();
    } else {
      toast.error(responseData.message);
    }
  };


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full flex justify-start px-2">
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Akun
          </DialogTitle>
          <DialogDescription>
            Masukkan username, email, password untuk mengubah data akun.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={username || ""}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4"> 
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                value={password || ""}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="col-span-3"
              />
            </div>
            {/* konfirmasi password */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input id="confirmPassword" name="confirmPassword" placeholder="Masukkan konfirmasi password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="col-span-3" />
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
