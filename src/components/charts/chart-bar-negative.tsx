"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, LabelList } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface BarChartNegativeDataItem {
  month: string;
  netProfit: number;
}

interface ChartBarNegativeProps {
  data: BarChartNegativeDataItem[];
  title?: string;
  description?: string;
}

const chartConfig = {
  netProfit: {
    label: "صافي الربح",
  },
} satisfies ChartConfig

export function ChartBarNegative({
  data,
  title = "صافي الربح الشهري",
  description = "عرض صافي الربح (الإيرادات - المصروفات) لكل شهر",
}: ChartBarNegativeProps) {
  const totalProfit = data.reduce((sum, item) => sum + item.netProfit, 0);
  const avgProfit = totalProfit / data.length;
  const isPositiveTrend = avgProfit > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <BarChart accessibilityLayer data={data} margin={{ left: 8, right: 8, top: 5, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel hideIndicator />}
            />
            <Bar dataKey="netProfit" radius={3}>
              <LabelList 
                position="top" 
                dataKey="month" 
                fillOpacity={1} 
                fontSize={10}
                offset={4}
              />
              {data.map((item) => (
                <Cell
                  key={item.month}
                  fill={item.netProfit > 0 ? "var(--chart-1)" : "var(--chart-2)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
