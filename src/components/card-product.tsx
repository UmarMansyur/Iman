
export default function CardDashboard({ icon, title, value}: { icon: React.ReactNode, title: string, value: string }) {
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
    </div>
  </div>
  )
}