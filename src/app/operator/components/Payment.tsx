/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { LabelList, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
export function Payment({
  title,
  description,
  chartData,
}: {
  title: string;
  description: string;
  chartData: any[];
}) {
  const colorPalette = [
    "#60a5fa", // blue-600
    "#34d399", // green-600
    "#f472b6", // fuchsia-600
    "#f97316", // orange-600
    "#a78bfa", // violet-600
    "#22d3ee", // cyan-600
    "#facc15", // yellow-600
    "#e2e8f0", // slate-600
    "#fbcfe8", // pink-600
    "#bae6fd", // sky-600
  ];
  if (!chartData || chartData.length === 0) return null;
  const chartConfig = chartData.map((item: any, index: number) => {
    return {
      payment_method_name: item.payment_method_name,
      total_payment_method: item.total_payment_method,
      fill: colorPalette[index],
    };
  });


  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig as any}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartConfig}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent hideLabel nameKey="payment_method_name" />
              }
            />
            <RadialBar dataKey="total_payment_method" background>
              <LabelList
                position="insideStart"
                dataKey="payment_method_name"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartConfig.map((item) => (
            <div
              key={item.payment_method_name}
              className="flex items-center gap-2"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm capitalize">
                {item.payment_method_name}:{" "}
                {new Intl.NumberFormat().format(item.total_payment_method)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
