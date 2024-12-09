/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import MainPage from '@/components/main';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import {  useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUser, updateUser } from '@/app/actions/user';
import { User } from '@prisma/client';
import { UpdateUserFormState } from '@/lib/definitions';
import toast from 'react-hot-toast';
import LoaderScreen from '@/components/views/loader';


export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [state, setState] = useState<UpdateUserFormState | undefined>(undefined);
  const id = params.id;
  useEffect(() => {
    if (id) fetchUser();
  }, []);

  const fetchUser = async () => {
    const user = await getUser(parseInt(id as string));
    if (user) {
      setUser(user);
      const birthDate = new Date(user.date_of_birth);
      setDate(birthDate);
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await updateUser(undefined, formData);
    if(result?.errors) {
      setState(result);
    } else {
      toast.success(result?.message || 'Pengguna berhasil diperbarui');
      router.push('/admin/pengguna');
    }
  }

  if (!user) {
    return (
      <MainPage>
        <LoaderScreen />
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
          <form onSubmit={handleSubmit} className='space-y-4 pt-3'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium mb-3'>Email: <sup className='text-red-500'>*</sup></Label>
                <Input
                  type="hidden"
                  name="id"
                  value={user.id}
                />
                <Input 
                  type="email" 
                  placeholder="contoh@email.com"
                  defaultValue={user.email}
                  name="email"
                />
                {state?.errors?.email && (
                  <span className="text-sm text-red-500">{state.errors.email}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Username: <sup className='text-red-500'>*</sup></Label>
                <Input 
                  type="text" 
                  placeholder="username"
                  defaultValue={user.username}
                  name="username"
                />
                {state?.errors?.username && (
                  <span className="text-sm text-red-500">{state.errors.username}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Jenis Kelamin: <sup className='text-red-500'>*</sup></Label>
                <Select 
                  defaultValue={user.gender}
                  name="gender"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Laki-laki</SelectItem>
                    <SelectItem value="Female">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.gender && (
                  <span className="text-sm text-red-500">{state.errors.gender}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Tanggal Lahir: <sup className='text-red-500'>*</sup></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? 
                        new Date(date?.toDateString() || '').toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        }) : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => {
                        if (newDate) {
                          setDate(newDate);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {state?.errors?.date_of_birth && (
                  <span className="text-sm text-red-500">{state.errors.date_of_birth}</span>
                )}
                <input type="hidden" name="date_of_birth" value={date?.toISOString()} />
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Tipe Pengguna: <sup className='text-red-500'>*</sup></Label>
                <Select 
                  defaultValue={user.user_type}
                  name="user_type"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tipe Pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operator">Operator</SelectItem>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
                {state?.errors?.user_type && (
                  <span className="text-sm text-red-500">{state.errors.user_type}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Thumbnail:</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                />
                {state?.errors?.thumbnail && (
                  <span className="text-sm text-red-500">{state.errors.thumbnail}</span>
                )}
              </div>
              <div className='col-span-2'>
                <Label className='text-sm font-medium mb-3'>Alamat: <sup className='text-red-500'>*</sup></Label>
                <Textarea 
                  rows={5} 
                  defaultValue={user.address}
                  name="address"
                />
                {state?.errors?.address && (
                  <span className="text-sm text-red-500">{state.errors.address}</span>
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
              >
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </MainPage>
  );
}