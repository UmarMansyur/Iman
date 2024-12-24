import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem, Label } from "@radix-ui/react-dropdown-menu";
import { Check} from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "./ui/input";
import { useState } from "react";
import { useUserStore } from "@/store/user-store";

export default function SelesaiButton({
  fetchData,
  id,
}: {
  fetchData: () => Promise<void>;
  id: string;
}) {
  const [recipient, setRecipient] = useState("");
  const { user } = useUserStore();
  const handleSelesai = async () => {
    if(!recipient) {
      toast.error("Nama penerima tidak boleh kosong");
      return;
    }
    const response = await fetch(`/api/transaction/status-pengiriman?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "Done",
        recipient: recipient,
        user_id: user?.id,
        factory_id: user?.factory_selected?.id
      }),
    });
    const data = await response.json();
    if (response.ok) {
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
    fetchData();
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none">
          <Check className="w-4 h-4" />
          Selesai
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah anda telah menerima barang? Data ini tidak dapat dibatalkan jika anda telah menerima barang.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* label */}
        <form action="">
          <Label className="text-sm font-semibold">
            Nama Penerima: 
          </Label>
          <Input className="w-full" placeholder="Nama Penerima" onChange={(e) => setRecipient(e.target.value)} value={recipient || ""} />
        </form>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-blue-500 hover:bg-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            onClick={() => handleSelesai()}
          >
            Ya, Simpan
          </AlertDialogAction>
          <AlertDialogCancel>Batal</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
