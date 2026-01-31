"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"

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

export const description = "A radial chart showing budget breakdown"

interface ChartRadialStackedProps {
    revenue: number;
    expenses: number;
    title?: string;
    description?: string;
}

const chartConfig = {
    revenue: {
        label: "إجمالي الإيرادات",
        color: "var(--chart-3)",
    },
    expenses: {
        label: "إجمالي المصروفات",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function ChartRadialStacked({ revenue, expenses, title = "ملخص الميزانية", description = "تحليل الإيرادات والمصروفات" }: ChartRadialStackedProps) {
    const chartData = [{ name: "budget", revenue: revenue, expenses: expenses }]
    const isTrendingUp = revenue >= expenses

    return (
        <Card className="flex flex-col h-full border-primary/20 gap-0">
            <CardHeader className="items-center p-2 pb-0">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                {/* <CardDescription className="text-xs">{description}</CardDescription> */}
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto w-full max-w-[180px] h-[100px]"
                >
                    <RadialBarChart
                        data={chartData}
                        endAngle={180}
                        innerRadius={60}
                        outerRadius={100}
                        cx="50%"
                        cy="80%"
                        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) - 12}
                                                    className="fill-foreground text-xl font-bold"
                                                >
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 8}
                                                    className="fill-muted-foreground text-[10px]"
                                                >
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                        <RadialBar
                            dataKey="revenue"
                            stackId="a"
                            cornerRadius={5}
                            fill="var(--color-revenue)"
                            className="stroke-transparent stroke-2"
                        />
                        <RadialBar
                            dataKey="expenses"
                            fill="var(--color-expenses)"
                            stackId="a"
                            cornerRadius={5}
                            className="stroke-transparent stroke-2"
                        />
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-1 text-[10px] pb-2 pt-0">
                <div className="flex items-center gap-1 leading-none font-medium">
                    {isTrendingUp ? (
                        <>
                            الإيرادات تفوق المصروفات <TrendingUp className="h-3 w-3 text-green-600" />
                        </>
                    ) : (
                        <>
                            المصروفات تفوق الإيرادات <TrendingDown className="h-3 w-3 text-red-600" />
                        </>
                    )}
                </div>
            </CardFooter>
        </Card>
    )
}
