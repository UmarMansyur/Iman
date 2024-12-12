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
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { Check} from "lucide-react";
import toast from "react-hot-toast";

export default function SelesaiButton({
  fetchData,
  id,
}: {
  fetchData: () => Promise<void>;
  id: string;
}) {
  const handleSelesai = async () => {
    const response = await fetch(`/api/transaction/status-pengiriman?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "Done",
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
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-blue-500 hover:bg-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            onClick={() => handleSelesai()}
          >
            Ya, Selesai
          </AlertDialogAction>
          <AlertDialogCancel>Batal</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
