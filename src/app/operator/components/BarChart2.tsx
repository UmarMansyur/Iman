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
  total_remaining_balance: {
    label: "Sisa Pembayaran Invoice",
    color: "hsl(217.2 91.2% 59.8%)",
  },
} satisfies ChartConfig;

export default function BarChart2({
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
              dataKey="total_remaining_balance"
              fill={chartConfig.total_remaining_balance.color}
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
              style={{ backgroundColor: chartConfig.total_remaining_balance.color }}
            ></div>
            <p className="text-sm text-gray-500">
              {chartConfig.total_remaining_balance.label}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
