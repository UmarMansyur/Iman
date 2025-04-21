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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { id } from 'date-fns/locale'
import { useState } from "react"
import { useRouter } from "next/navigation";
import { createUser } from '@/app/actions/user';
import { UserFormState } from '@/lib/definitions';
import toast from 'react-hot-toast';


export default function CreateUserPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>();
  const [state, setState] = useState<UserFormState | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const result = await createUser(undefined, formData);
      if(result?.errors) {
        toast.error(result.message || 'Gagal menambahkan pengguna');
        setState(result);
      } else {
        toast.success(result?.message || 'Pengguna berhasil ditambahkan');
        router.push('/admin/pengguna');
      }
    } finally {
      setIsLoading(false);
    }
  }

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
          <form onSubmit={handleSubmit} className='space-y-4 pt-3'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-sm font-medium mb-3'>Email:</Label>
                <Input 
                  type="email" 
                  placeholder="contoh@email.com"
                  name="email"
                />
                {state?.errors?.email && (
                  <span className="text-sm text-red-500">{state.errors.email}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Username:</Label>
                <Input 
                  type="text" 
                  placeholder="username"
                  name="username"
                />
                {state?.errors?.username && (
                  <span className="text-sm text-red-500">{state.errors.username}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Password:</Label>
                <Input 
                  type="password" 
                  placeholder="******"
                  name="password"
                />
                {state?.errors?.password && (
                  <span className="text-sm text-red-500">{state.errors.password}</span>
                )}
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Jenis Kelamin:</Label>
                <Select name='gender'>
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
                        const formattedDate = newDate ? format(newDate, 'yyyy-MM-dd') : '';
                        const hiddenInput = document.querySelector('input[name="date_of_birth"]') as HTMLInputElement;
                        if (hiddenInput) {
                          hiddenInput.value = formattedDate;
                        }
                      }}
                      locale={id}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {state?.errors?.date_of_birth && (
                  <span className="text-sm text-red-500">{state.errors.date_of_birth}</span>
                )}
                <input 
                  type="hidden"
                  name="date_of_birth"
                  value={date ? format(date, 'yyyy-MM-dd') : ''}
                />
              </div>
              <div>
                <Label className='text-sm font-medium mb-3'>Tipe Pengguna:</Label>
                <Select name='user_type'>
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
              <div className='col-span-2'>
                <Label className='text-sm font-medium mb-3'>Thumbnail:</Label>
                <Input 
                  type="file" 
                  accept="image/*"
                  name="thumbnail"
                />
                {state?.errors?.thumbnail && (
                  <span className="text-sm text-red-500">{state.errors.thumbnail}</span>
                )}
              </div>
              <div className='col-span-2'>
                <Label className='text-sm font-medium mb-3'>Alamat:</Label>
                <Textarea 
                  rows={5} 
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
                className="bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
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
