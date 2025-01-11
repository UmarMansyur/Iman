/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  pendapatan: {
    label: "Pendapatan",
    color: "hsl(217.2 91.2% 59.8%)",
  },
  pendapatan_service: {
    label: "Pendapatan Service",
    color: "hsl(47.9 95.8% 53.1%)",
  },
} satisfies ChartConfig;

export default function BarChartOwner({
  title,
  description,
  chartData,
}: {
  title: string;
  description: string;
  chartData: any;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="pendapatan"
              fill={chartConfig.pendapatan.color}
              radius={8}
            />
            <Bar
              dataKey="pendapatan_service"
              fill={chartConfig.pendapatan_service.color}
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex items-center justify-center w-full gap-2">
          <div className="flex flex-row items-center">
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: chartConfig.pendapatan.color }}
            ></div>
            <p className="text-sm text-gray-500">
              {chartConfig.pendapatan.label}
            </p>
          </div>
          <div className="flex flex-row items-center">
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: chartConfig.pendapatan_service.color }}
            ></div>
            <p className="text-sm text-gray-500">
              {chartConfig.pendapatan_service.label}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
