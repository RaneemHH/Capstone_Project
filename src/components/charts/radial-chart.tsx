import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
 
} from "@/components/ui/card";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import Lottie from "lottie-react";
interface RadialChartProps {
  title: string;
  value: number;
  maxValue?: number;
  config: ChartConfig;
  dataKey?: string;
  fillColor: string;
  startAngle?: number;
  endAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
  animationData?: object;
}

export const RadialChart = ({
  title,
  value,
  maxValue,
  config,
  dataKey = "value",
  fillColor,
  startAngle = 90,
  //   endAngle = 360,
  innerRadius = 55,
  outerRadius = 70,
  className = "",
  animationData,
}: RadialChartProps) => {
  const chartData = [{ [dataKey]: value, fill: fillColor }];
  const percentage = maxValue && maxValue > 0 ? value / maxValue : 1;
  const calculatedEndAngle = startAngle + percentage * 360;

  return (
    <Card className={`flex flex-col items-center ${className}`}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="relative mx-auto aspect-square w-30 h-30 flex items-center justify-center">
          <ChartContainer
            config={config}
            className="absolute inset-0 w-full h-full"
          >
            <RadialBarChart
              data={chartData}
              startAngle={startAngle}
              endAngle={calculatedEndAngle}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-gray-200 dark:first:fill-gray-800 last:fill-background"
                polarRadius={[outerRadius - 12, innerRadius - 3]}
              />
              <RadialBar dataKey={dataKey} background cornerRadius={10} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-bold"
                          >
                            {/* {value.toLocaleString()} */}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
          {/* Overlay Lottie animation in the center, if provided */}
          {animationData && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Lottie animationData={animationData} loop={true} style={{ width: '75px', height: '75px' }} />
            </div>
          )}
        </div>
        <div className="mt-2 text-center">
          <div className="text-xs font-medium text-muted-foreground">
            {title} - {value.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
