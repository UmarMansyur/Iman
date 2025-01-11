/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useState } from "react";
import moment from "moment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LineChartComponent({
  title,
  description,
  chartData,
}: {
  title: string;
  description: string;
  chartData: any[];
}) {
  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <p>Tidak ada data yang tersedia</p>
        </CardContent>
      </Card>
    );
  }

  const startDate = new Date(chartData[0]?.tanggal);
  const endDate = new Date(chartData[chartData.length - 1]?.tanggal);
  const diffInDays = Math.ceil(moment(endDate).diff(moment(startDate), "days"));
  const [timeRange, setTimeRange] = useState(
    diffInDays >= 90 ? "90d" : diffInDays >= 30 ? "30d" : "7d"
  );

  const productKeys = Object.keys(chartData[0]).filter(
    (key) => key !== "tanggal"
  );
  const colorPalette = [
    "#bfdbfe", // blue-200
    "#bbf7d0", // green-200
    "#f5d0fe", // fuchsia-200
    "#fed7aa", // orange-200
    "#ddd6fe", // violet-200
    "#a5f3fc", // cyan-200
    "#fef08a", // yellow-200
    "#e2e8f0", // slate-200
    "#fbcfe8", // pink-200
    "#bae6fd", // sky-200
  ];

  const chartColors = productKeys.map(
    (_, index) => colorPalette[index % colorPalette.length]
  );

  const chartConfig: ChartConfig = productKeys.reduce(
    (config: any, key: string, index: number) => {
      config[key] = {
        label: key,
        color: chartColors[index],
      };
      return config;
    },
    {}
  );

  const filteredData = chartData.filter((item: any) => {
    const date = moment(item.tanggal);
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    } else if (timeRange === "90d") {
      daysToSubtract = 90;
    }
    const startDate = moment(item.tanggal).subtract(daysToSubtract, "days");
    return date >= startDate;
  });

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue
              placeholder={diffInDays <= 30 ? "Last 30 days" : "Last 3 months"}
            />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {diffInDays >= 90 && (
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
            )}
            {diffInDays >= 30 && (
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
            )}
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {productKeys.map((key, index) => (
                <linearGradient
                  key={key}
                  id={`fill${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={chartColors[index]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColors[index]}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="tanggal"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <ChartTooltip
              cursor={{ stroke: "#f0f0f0" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("id-ID", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            {productKeys.map((key, index) => (
              <Area
                key={key}
                dataKey={key}
                type="monotone"
                fill={chartColors[index]}
                stroke={chartColors[index]}
                strokeWidth={2}
                stackId="1"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
