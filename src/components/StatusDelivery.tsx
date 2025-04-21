import { Badge } from "./ui/badge";

export default function StatusDelivery({ status }: { status: string }) {
  return <Badge className={`${
    status === 'Process' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900' :
    status === 'Sent' ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900' :
    status === 'Done' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900' :
    status === 'Cancel' ? 'bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900' :
    'bg-gray-100 text-gray-800'
  } border-0`}>
    {
      status === 'Process' ? 'Sedang di Proses' :
      status === 'Sent' ? 'Sedang dalam Pengiriman' :
      status === 'Done' ? 'Sampai Tujuan / Selesai' :
      status === 'Cancel' ? 'Dibatalkan' : 'Menunggu'
    }
  </Badge>;
}
