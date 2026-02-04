
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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

export interface BarChartDataItem {
  category: string;
  value: number;
}

interface ChartBarLabelProps {
  data: BarChartDataItem[];
  title?: string;
  description?: string;
  footerText?: string;
  trendText?: string;
  dataKey?: string;
  categoryKey?: string;
}

export function ChartBarLabel({
  data,
  title = "Bar Chart - Label",
 
  dataKey = "value",
  categoryKey = "category",
}: ChartBarLabelProps) {
  // Generate dynamic chart config from data
  const chartConfig = {
    [dataKey]: {
      label: "القيمة",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-20 w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={categoryKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={3} maxBarSize={15} barSize={15}>
              <LabelList
                position="top"
                offset={4}
                className="fill-foreground"
                fontSize={8}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
     
    </Card>
  )
}
