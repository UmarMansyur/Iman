/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import MainPage from "@/components/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/store/user-store";
import Image from "next/image";
import { useEffect, useState } from "react";
import { CalendarIcon, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "react-hot-toast";

export default function MyAccount() {
  const { user } = useUserStore();
  const [form, setForm] = useState<any>({
    username: user?.username || "",
    email: user?.email || "",
    address: "",
    thumbnail: user?.thumbnail || null,
    gender: "",
    date_of_birth: new Date(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [tempThumbnail, setTempThumbnail] = useState(user?.thumbnail || "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchUser = async () => {
    const response = await fetch(`/api/user/${user?.id}`);
    const data = await response.json();
    setForm({
      username: data.username,
      email: data.email,
      address: data.address,
      thumbnail: data.thumbnail,
      gender: data.gender,
      date_of_birth: new Date(data.date_of_birth),
    });
    setTempThumbnail(data.thumbnail);
  };

  useEffect(() => {
    if (user) {
      fetchUser();
    }
  }, [user]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, thumbnail: file });
      const objectUrl = URL.createObjectURL(file);
      setTempThumbnail(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      username: form.username,
      email: form.email,
      address: form.address,
      thumbnail: form.thumbnail,
      gender: form.gender,
      date_of_birth: form.date_of_birth,
    };

    // convert data to form data
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("address", data.address);
    // jika thumbnail tidak ada perubahan atau null maka tidak perlu dikirim
    if (data.thumbnail) {
      if (data.thumbnail !== user?.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
      }
    }
    formData.append("gender", data.gender);
    formData.append("date_of_birth", data.date_of_birth.toISOString());
    setIsLoading(true);
    const response = await fetch(`/api/user/${user?.id}`, {
      method: "PATCH",
      body: formData,
    });
    const result = await response.json();
    setIsLoading(false);
    if (!response.ok) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      await fetchUser();
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Implementasi logika update password
    const data = {
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    };

    const response = await fetch(`/api/user/${user?.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  };

  return (
    <MainPage>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
        <Tabs defaultValue="account" className="w-full bg-white rounded-md p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Data Pribadi</TabsTrigger>
            <TabsTrigger value="password">Ubah Kata Sandi</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <h1 className="text-lg font-bold py-3">Data Pribadi</h1>
            <hr />
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative w-[100px] h-[100px]">
                    <Image
                      src={tempThumbnail || "https://ik.imagekit.io/8zmr0xxik/blob_c2rRi4vdU?updatedAt=1709077347010"}
                      className="rounded-full object-cover"
                      alt="avatar"
                      fill
                    />
                  </div>
                  <div className="flex flex-col mt-5 gap-2 w-full">
                    <Label className="text-sm font-bold">Foto Profil</Label>
                    <Input type="file" onChange={handleThumbnailChange} accept="image/*" />
                    <small className="text-xs text-gray-500">Ukuran foto profil maksimal 1MB</small>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Nama Lengkap</Label>
                  <Input type="text" value={form.username || ""} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Jenis Kelamin</Label>
                  <Select
                    value={form.gender || ""}
                    onValueChange={(value) => setForm({ ...form, gender: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Laki-laki</SelectItem>
                      <SelectItem value="Female">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Tanggal Lahir</Label>
                  <Popover>
                    <PopoverTrigger className="flex items-center gap-2 border rounded-md p-2">
                      <div className="flex items-start gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="text-sm">{format(form.date_of_birth, "PP")}</span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar mode="single" selected={form.date_of_birth} onSelect={(date) => setForm({ ...form, date_of_birth: date || new Date() })} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Email</Label>
                  <Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Alamat</Label>
                  <Textarea value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Simpan</>}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="password">
            <h1 className="text-lg font-bold py-3">Ubah Kata Sandi</h1>
            <hr />
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Kata Sandi Lama</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.oldPassword}
                      placeholder="Masukkan kata sandi lama"
                      onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Kata Sandi Baru</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      placeholder="Masukkan kata sandi baru"
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-bold">Konfirmasi Kata Sandi Baru</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      placeholder="Masukkan kata sandi baru"
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </MainPage>
  );
}