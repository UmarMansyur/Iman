/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import MainPage from "@/components/main";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { User } from "../../column";
import React from "react";

const userSchema = z.object({
  email: z.string().email("Email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  gender: z.enum(["Male", "Female"], {
    required_error: "Pilih jenis kelamin",
  }),
  date_of_birth: z.date({
    required_error: "Pilih tanggal lahir",
  }),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  user_type: z.enum(["Operator", "Administrator"], {
    required_error: "Pilih tipe pengguna",
  }),
  thumbnail: z
    .instanceof(FileList)
    .optional()
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      return file.size <= 5 * 1024 * 1024; // 5MB limit
    }, "Ukuran file maksimal 5MB")
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      return file.type.startsWith("image/");
    }, "File harus berupa gambar"),
});

type UserSchema = z.infer<typeof userSchema>;

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
  });

  const id = params.id;
  useEffect(() => {
    if (id) fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      if (id) {
        const response = await fetch(`/api/user?id=${id}`);
        if (!response.ok) throw new Error("Failed to fetch user");
        const userData = await response.json();
        setUser(userData);

        const birthDate = new Date(userData.user.date_of_birth);
        setDate(birthDate);

        if (userData.user) {
          form.reset({
            email: userData.user.email,
            username: userData.user.username,
            gender: userData.user.gender as "Male" | "Female",
            date_of_birth: birthDate,
            address: userData.user.address,
            user_type: userData.user.user_type as "Operator" | "Administrator",
          });
        }
      }
      setIsInitialized(true);
    } catch (error) {
      console.error(error);
      setIsInitialized(true);
    }
  };

  const onSubmit = async (data: UserSchema) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("id", id as string);
      formData.append("email", data.email);
      formData.append("username", data.username);
      formData.append("gender", data.gender);
      formData.append("date_of_birth", data.date_of_birth.toISOString());
      formData.append("address", data.address);
      formData.append("user_type", data.user_type);

      if (data.thumbnail instanceof FileList && data.thumbnail.length > 0) {
        formData.append("thumbnail", data.thumbnail[0]);
      }

      const response = await fetch("/api/user", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Gagal mengupdate data");
      }

      router.push("/admin/pengguna");
    } catch (error: any) {
      console.log(error);
      // Tambahkan toast notification di sini jika ada
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <MainPage>
        <Card>
          <CardContent className="flex items-center justify-center min-h-[200px]">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </MainPage>
    );
  }

  if (!user) {
    return (
      <MainPage>
        <Card>
          <CardContent className="flex items-center justify-center min-h-[200px]">
            <p>User not found</p>
          </CardContent>
        </Card>
      </MainPage>
    );
  }

  return (
    <MainPage>
      <Card>
        <CardHeader className="border-b pt-4 pb-2">
          <h1 className="text-lg font-semibold">Edit Pengguna</h1>
          <p className="text-sm text-muted-foreground">
            Edit data pengguna sistem.
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-3"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-3">Email:</Label>
                <Input
                  type="email"
                  placeholder="contoh@email.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </span>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-3">Username:</Label>
                <Input
                  type="text"
                  placeholder="username"
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.username.message}
                  </span>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-3">
                  Jenis Kelamin:
                </Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue("gender", value as "Male" | "Female")
                  }
                  value={form.getValues("gender")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Laki-laki</SelectItem>
                    <SelectItem value="Female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.gender && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.gender.message}
                  </span>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-3">
                  Tanggal Lahir:
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.getValues("date_of_birth") ? (
                        new Date(
                          date?.toDateString() || ""
                        ).toLocaleDateString()
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.getValues("date_of_birth")}
                      onSelect={(newDate) => {
                        if (newDate) {
                          setDate(newDate);
                          form.setValue("date_of_birth", newDate);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date_of_birth && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.date_of_birth.message}
                  </span>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-3">
                  Tipe Pengguna:
                </Label>
                <Select
                  onValueChange={(value) =>
                    form.setValue(
                      "user_type",
                      value as "Operator" | "Administrator"
                    )
                  }
                  value={form.getValues("user_type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe Pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operator">Operator</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.user_type && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.user_type.message}
                  </span>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium mb-3">Thumbnail:</Label>
                <Input
                  type="file"
                  accept="image/*"
                  {...form.register("thumbnail")}
                />
                {form.formState.errors.thumbnail && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.thumbnail.message as string}
                  </span>
                )}
              </div>
              <div className="col-span-2">
                <Label className="text-sm font-medium mb-3">Alamat:</Label>
                <Textarea rows={5} {...form.register("address")} />
                {form.formState.errors.address && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.address.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/pengguna")}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainPage>
  );
}
