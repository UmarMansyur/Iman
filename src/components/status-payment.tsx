import { Badge } from "./ui/badge";

export default function StatusPayment({ status }: { status: string }) {
  if (status === "Unpaid") {
    return (
      <Badge
        variant="outline"
        className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-800 dark:text-yellow-300 border-0`}
      >
       Belum Bayar
      </Badge>
    );
  }
  if (status === "Pending") {
    return (
      <Badge
        variant="outline"
        className={`bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-800 dark:text-blue-300 border-0`}
      >
        Menunggu Konfirmasi
      </Badge>
    );
  }
  if (status === "Paid") {
    return (
      <Badge
        variant="outline"
        className={`bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-300 border-0`}
      >
        Dibayar Sebagian
      </Badge>
    );
  }
  if (status === "Failed") {
    return (
      <Badge
        variant="outline"
        className={`bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300 border-0`}
      >
        Gagal
      </Badge>
    );
  }
  if (status === "Cancelled") {
    return (
      <Badge
        variant="outline"
        className={`bg-red-100 text-red-800 hover:bg-red-100/80 dark:bg-red-800 dark:text-red-300 border-0`}
      >
        Ditolak
      </Badge>
    );
  }
  if (status === "Paid_Off") {
    return (
      <Badge
        variant="outline"
        className={`bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-300 border-0`}
      >
        Lunas
      </Badge>
    );
  }
}
