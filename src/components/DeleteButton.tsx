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
import { Trash } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import {
  UseBaseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export default function DeleteButtonQuery({
  endpoint,
  id,
  disabled,
  queryKey,
}: {
  endpoint: string;
  id: string;
  disabled?: boolean;
  queryKey: string;
}) {
  const handleDelete = async (id: string) => {
    return await fetch(`/api/${endpoint}/${id}`, {
      method: "DELETE",
    });
  };

  const useDelete = (): UseBaseMutationResult => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: () => handleDelete(id),
      onSuccess: () => {
        toast.success("Data berhasil dihapus!");
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
      onError: (error) => {
        toast.error(error.message);
      }
    });
  };

  const { mutate } = useDelete();

  return disabled ? (
    <Button
      variant="outline"
      disabled
      className="w-full justify-start ps-3 border-none"
    >
      <Trash className="w-4 h-4" />
      Hapus
    </Button>
  ) : (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="flex items-center gap-2 hover:bg-gray-50 rounded-md cursor-pointer text-sm text-red-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none p-2"
        >
          <Trash className="w-4 h-4 mr-1" />
          Hapus
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara
            permanen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            onClick={() => mutate(id)}
          >
            Ya, Hapus
          </AlertDialogAction>
          <AlertDialogCancel>Batal</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
