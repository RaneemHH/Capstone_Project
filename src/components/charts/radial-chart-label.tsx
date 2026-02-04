"use client"

import { LabelList, RadialBar, RadialBarChart } from "recharts"

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

export interface RadialChartDataItem {
  name: string;
  value: number;
  fill: string;
}

interface RadialChartLabelProps {
  data: RadialChartDataItem[];
  title: string;
  description?: string;
  footerText?: string;
  trendText?: string;
  dataKey?: string;
  nameKey?: string;
}

export function RadialChartLabel({
  data,
  title,
  dataKey = "value",
  nameKey = "name",
}: RadialChartLabelProps) {
  // Build chart config dynamically from data
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill || `var(--chart-${index + 1})`,
    };
    return acc;
  }, {
    [dataKey]: {
      label: dataKey,
    },
  } as ChartConfig);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {/* {description && <CardDescription>{description}</CardDescription>} */}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <RadialBarChart
            data={data}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey={nameKey} />}
            />
            <RadialBar dataKey={dataKey} background>
              <LabelList
                position="insideStart"
                dataKey={nameKey}
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      {/* {(footerText || trendText) && (
        <CardFooter className="flex-col gap-2 text-sm">
          {trendText && (
            <div className="flex items-center gap-2 leading-none font-medium">
              {trendText} <TrendingUp className="h-4 w-4" />
            </div>
          )}
          {footerText && (
            <div className="text-muted-foreground leading-none">
              {footerText}
            </div>
          )}
        </CardFooter>
      )} */}
    </Card>
  )
}
