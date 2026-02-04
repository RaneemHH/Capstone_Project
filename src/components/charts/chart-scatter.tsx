"use client"

import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface ScatterChartDataItem {
  university: string;
  requestCount: number;
  totalAmount: number;
}

interface ChartScatterProps {
  data: ScatterChartDataItem[];
  title?: string;
  description?: string;
}

const chartConfig = {
  requestCount: {
    label: "عدد الطلبات",
    color: "var(--chart-1)",
  },
  totalAmount: {
    label: "المبلغ الإجمالي",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartScatter({
  data,
  title = "توزيع الطلبات حسب الجامعة",
}: ChartScatterProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {/* {description && <CardDescription className="text-xs">{description}</CardDescription>} */}
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
        <ChartContainer config={chartConfig} className="h-70 w-full">
          <ScatterChart
            accessibilityLayer
            margin={{
              left: 8,
              right: 8,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="requestCount"
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={{ fontSize: 10 }}
              label={{ value: "عدد الطلبات", position: "insideBottom", offset: -5, fontSize: 10 }}
            />
            <YAxis
              dataKey="totalAmount"
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={{ fontSize: 10 }}
              label={{ value: "المبلغ ($)", angle: -90, position: "insideLeft", fontSize: 10 }}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Scatter
              name="الجامعات"
              data={data}
              fill="var(--color-requestCount)"
            />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
