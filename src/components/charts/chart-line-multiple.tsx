"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface LineChartDataItem {
  month: string;
  revenue: number;
  expenses: number;
}

interface ChartLineMultipleProps {
  data: LineChartDataItem[];
  title?: string;
  description?: string;
  footerText?: string;
  trendText?: string;
}

const chartConfig = {
  revenue: {
    label: "الإيرادات",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "المصروفات",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartLineMultiple({
  data,
  title = "Line Chart - Multiple",
  
  footerText,
  trendText,
}: ChartLineMultipleProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {/* {description && <CardDescription className="text-xs">{description}</CardDescription>} */}
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 8,
              right: 8,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => value}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="expenses"
              type="monotone"
              stroke="var(--color-expenses)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {(trendText || footerText) && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              {trendText && (
                <div className="flex items-center gap-2 leading-none font-medium">
                  {trendText} <TrendingUp className="h-4 w-4" />
                </div>
              )}
              {footerText && (
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  {footerText}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
