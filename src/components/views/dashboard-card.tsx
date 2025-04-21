import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  value: string | number;
  background?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink';
  details?: {
    left: { label: string; value: string }[];
    right: { label: string; value: string }[];
  };
}

export function DashboardCard({
  title,
  icon,
  value,
  background = 'blue',
  details,
}: DashboardCardProps) {
  const getBackgroundClass = () => {
    const baseClass = "hover:bg-gradient-to-r hover:lg:-rotate-6 hover:rounded-2xl hover:text-white rounded-lg";
    
    const gradientClasses = {
      red: "hover:from-[#FF9066] hover:to-[#FF9066]",
      blue: "hover:from-[#3B82F6] hover:to-[#3B82F6]",
      green: "hover:bg-[#4AD991] hover:to-[#4AD991]",
      yellow: "hover:bg-[#FEC53D] hover:to-[#FEC53D]",
      purple: "hover:from-purple-500 hover:to-purple-600",
      pink: "hover:from-pink-500 hover:to-pink-600",
    };

    return `${baseClass} ${gradientClasses[background]}`;
  };

  return (
    <Card className={`p-2 shadow-none hover:border-spacing-0`}>
      <div className={getBackgroundClass()}>
        <CardHeader className="mb-0 pb-2 bg-transparent">
          <CardTitle className="flex justify-between">
            <small className="hover:text-white">{title}</small>
            <Button
              variant="ghost"
              size="icon"
              className="bg-transparent hover:bg-transparent"
            >
              <ArrowUpRight className="w-8 h-8 hover:text-white font-bold" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center justify-between gap-2 pb-2">
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full bg-white/50"
            >
              {icon}
            </Button>
            <p className="text-4xl font-medium hover:text-white text-end">
              {value}
            </p>
          </div>
          <div className="flex gap-2 justify-between">
            <div className="flex flex-col">
              {details?.left.map((item, index) => (
                <p key={index} className="text-sm hover:text-white">
                  {item.label} {formatNumber(item.value)}
                </p>
              ))}
            </div>
            <div className="flex flex-col">
              {details?.right.map((item, index) => (
                <p key={index} className="text-sm hover:text-white text-end">
                  {item.label} {formatNumber(item.value)}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
} 

function formatNumber(value: string) {
  // format to 3 digits
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
