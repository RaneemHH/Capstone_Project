"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
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

export interface RadarChartDataItem {
  category: string;
  value: number;
}

export interface ChartRadarGridCircleProps {
  data: RadarChartDataItem[];
  title?: string;
  description?: string;
  footerText?: string;
  trendText?: string;
  dataKey?: string;
  categoryKey?: string;
  maxHeight?: string;
}

export function ChartRadarGridCircle({
  data,
  title = "Radar Chart - Grid Circle",
  description = "Showing total visitors for the last 6 months",
  footerText,
  trendText,
  dataKey = "value",
  categoryKey = "category",
  maxHeight = "250px"
}: ChartRadarGridCircleProps) {
  const chartConfig = {
    [dataKey]: {
      label: dataKey,
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square"
          style={{ maxHeight }}
        >
          <RadarChart data={data}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarGrid gridType="circle" />
            <PolarAngleAxis dataKey={categoryKey} />
            <Radar
              dataKey={dataKey}
              fill={`var(--color-${dataKey})`}
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      {(trendText || footerText) && (
        <CardFooter className="flex-col gap-2 text-sm">
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
        </CardFooter>
      )}
    </Card>
  )
}
