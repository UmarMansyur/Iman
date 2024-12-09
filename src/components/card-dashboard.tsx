import { ChartArea } from "lucide-react";

export default function CardDashboard({ icon, title, value, percentage, startDate, endDate }: { icon: React.ReactNode, title: string, value: number, percentage: number, startDate: string, endDate: string }) {
  return (
    <div className="rounded-xl shadow-lg border overflow-hidden relative bg-white">
    <div className="flex items-center gap-4 px-6 py-6">
      <div className="p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
      <div className="flex items-center gap-2 ms-auto bg-green-300/30 text-green-500 px-2 py-2 rounded-lg">
        <p className="text-xs">{percentage}%</p>
        <ChartArea className="size-4" />
      </div>
    </div>
    <div className="flex w-full bg-gray-100 text-gray-500">
      <div className="px-4 py-2">
        <p className="text-xs">Dari {startDate} - {endDate}</p>
      </div>
    </div>
  </div>
  )
}