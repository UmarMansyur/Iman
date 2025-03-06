export default function CardDashboard({ icon, title, value, startDate, endDate, color = "blue" }: { icon: React.ReactNode, title: string, value: string, startDate: string, endDate: string, color: string }) {
  // Map color string to actual Tailwind classes
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string, text: string, gradient: string }> = {
      blue: { 
        bg: "bg-blue-100", 
        text: "text-blue-500", 
        gradient: "bg-gradient-to-r from-blue-500 to-blue-600" 
      },
      red: { 
        bg: "bg-red-100", 
        text: "text-red-500", 
        gradient: "bg-gradient-to-r from-red-500 to-red-600" 
      },
      green: { 
        bg: "bg-green-100", 
        text: "text-green-500", 
        gradient: "bg-gradient-to-r from-green-500 to-green-600" 
      },
      yellow: { 
        bg: "bg-yellow-100", 
        text: "text-yellow-500", 
        gradient: "bg-gradient-to-r from-yellow-500 to-yellow-600" 
      },
      // Add more colors as needed
    };
    
    return colorMap[color] || colorMap.blue; // Default to blue if color not found
  };
  
  const colorClasses = getColorClasses(color);
  
  return (
    <div className="rounded-xl shadow-lg border overflow-hidden relative flex flex-col justify-between">
      <div className="flex items-center gap-4 px-6 py-6">
        <div className={`p-3 rounded-lg ${colorClasses.bg} ${colorClasses.text}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
      <div className={`flex w-full ${colorClasses.gradient} text-white`}>
        <div className="px-4 py-2">
          <p className="text-xs">Dari {startDate} - {endDate}</p>
        </div>
      </div>
    </div>
  )
}