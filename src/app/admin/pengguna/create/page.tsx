'use client';
import MainPage from '@/components/main';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-dropdown-menu';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { id } from 'date-fns/locale'
import { useState } from "react"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const userSchema = z.object({
  email: z.string().email("Email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
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
  thumbnail: z.any(),
});

type UserSchema = z.infer<typeof userSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
  });

  const [date, setDate] = useState<Date | undefined>(form.getValues("date_of_birth"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: UserSchema) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('username', data.username);
      formData.append('password', data.password);
      formData.append('gender', data.gender);
      formData.append('date_of_birth', data.date_of_birth.toISOString());
      formData.append('address', data.address);
      formData.append('user_type', data.user_type);
      const file = (data.thumbnail as FileList)[0];
      if (file) {
        formData.append('thumbnail', file);
      }

      const response = await fetch('/api/user', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Gagal menyimpan data');
      
      router.push('/admin/pengguna');
    } catch (error) {
      console.error(error);
      // Add toast notification here if you have one
    } finally {
      setIsSubmitting(false);
    }
  };

  return(
    <MainPage>
        <Card>
        <CardHeader className="border-b pt-4 pb-2">
          <h1 className="text-lg font-semibold">Tambah Pengguna</h1>
          <p className="text-sm text-muted-foreground">
            Tambahkan pengguna baru ke sistem.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 pt-3'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium mb-3'>Email:</Label>
                <Input 
                  type="email" 
                  placeholder="contoh@email.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <span className="text-sm text-red-500">{form.formState.errors.email.message}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Username:</Label>
                <Input 
                  type="text" 
                  placeholder="username"
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <span className="text-sm text-red-500">{form.formState.errors.username.message}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Password:</Label>
                <Input 
                  type="password" 
                  placeholder="******"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <span className="text-sm text-red-500">{form.formState.errors.password.message}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Jenis Kelamin:</Label>
                <Select onValueChange={(value) => form.setValue("gender", value as "Male" | "Female")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Laki-laki</SelectItem>
                    <SelectItem value="Female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.gender && (
                  <span className="text-sm text-red-500">{form.formState.errors.gender.message}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Tanggal Lahir:</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: id }) : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        form.setValue("date_of_birth", newDate as Date);
                      }}
                      locale={id}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date_of_birth && (
                  <span className="text-sm text-red-500">{form.formState.errors.date_of_birth.message}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Tipe Pengguna:</Label>
                <Select onValueChange={(value) => form.setValue("user_type", value as "Operator" | "Administrator")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe Pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operator">Operator</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.user_type && (
                  <span className="text-sm text-red-500">{form.formState.errors.user_type.message}</span>
                )}
              </div>
              <div className='col-span-2'>
                <Label className='text-sm font-medium mb-3'>Thumbnail:</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  {...form.register("thumbnail")}
                />
                {form.formState.errors.thumbnail && (
                  <span className="text-sm text-red-500">{form.formState.errors.thumbnail.message as string}</span>
                )}
              </div>
              <div className='col-span-2'>
                <Label className='text-sm font-medium mb-3'>Alamat:</Label>
                <Textarea 
                  rows={5} 
                  {...form.register("address")}
                />
                {form.formState.errors.address && (
                  <span className="text-sm text-red-500">{form.formState.errors.address.message}</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/pengguna')}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className='bg-blue-500 hover:bg-blue-600'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainPage>
  );
}
