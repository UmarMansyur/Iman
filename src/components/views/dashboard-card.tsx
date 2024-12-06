import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  value: string | number;
  background?: string;
  details: {
    left: { label: string; value: string }[];
    right: { label: string; value: string }[];
  };
}

export function DashboardCard({
  title,
  icon,
  value,
  background = "bg-blue-500",
  details,
}: DashboardCardProps) {
  return (
    <Card className={`p-2 text-white bg-transparent border-0 shadow-none hover:bg-white hover:border-spacing-0`}>
      <div
        className={`hover:bg-gradient-to-r hover:lg:-rotate-6 hover:from-${background}-500 hover:to-${background}-600 hover:rounded-2xl hover:text-white bg-${background}-500 rounded-lg`}
      >
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
          <div className="flex items-center gap-2 pb-2">
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-full bg-white/50"
            >
              {icon}
            </Button>
            <p className="text-4xl font-medium hover:text-white ps-5">
              {value}
            </p>
          </div>
          <div className="flex gap-2 justify-between">
            <div className="flex flex-col">
              {details.left.map((item, index) => (
                <p key={index} className="text-sm hover:text-white">
                  {item.label} {item.value}
                </p>
              ))}
            </div>
            <div className="flex flex-col">
              {details.right.map((item, index) => (
                <p key={index} className="text-sm hover:text-white text-end">
                  {item.label} {item.value}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
} 