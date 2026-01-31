"use client"

import { useMemo } from "react"
import { Label, Pie, PieChart } from "recharts"

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
import { useBoothStore } from "@/stores/booth-store"

export const description = "An interactive pie chart showing available booths by zone"

// Arabic zone labels mapping
const zoneLabels: Record<string, string> = {
    "ZONE_A": "المنطقة أ",
    "ZONE_B": "المنطقة ب",
    "ZONE_C": "المنطقة ج",
    "ZONE_D": "المنطقة د",
    "ZONE_E": "المنطقة هـ",
}

// Generate chart config dynamically based on zones
const generateChartConfig = (zones: string[]): ChartConfig => {
    const config: ChartConfig = {}
    const colors = [
        "var(--chart-1)",
        "var(--chart-2)",
        "var(--chart-3)",
        "var(--chart-4)",
        "var(--chart-5)",
    ]

    zones.forEach((zone, index) => {
        config[zone] = {
            label: zoneLabels[zone] || zone,
            color: colors[index % colors.length],
        }
    })

    return config
}

export function ChartPieInteractive() {
    const { availableBooths, isLoadingAvailable } = useBoothStore()

    // Transform availableBooths map to chart data
    const chartData = useMemo(() => {
        // return Object.entries(availableBooths).map(([zone, count]) => ({
        //     zone,
        //     booths: count,
        //     fill: `var(--color-${zone})`,
        // }))
        return [
            {
                zone: "remainingBooths",
                booths: availableBooths["remainingBooths"],
                fill: `var(--chart-3)`,
            },
            {
                zone: "usedUniBoothNb",
                booths: availableBooths["usedUniBoothNb"],
                fill: `var(--chart-2)`,
            },
            {
                zone: "usedActivityProvidersNb",
                booths: availableBooths["usedActivityProvidersNb"],
                fill: `var(--chart-5)`,
            },

        ]
    }, [availableBooths])


    // Generate chart config based on available zones
    const chartConfig = useMemo(() => {
        const zones = Object.keys(availableBooths)
        // const zones = {
        //     availableBooths["remainingBooths"] :av
        // }
        return generateChartConfig(zones)
    }, [availableBooths])
    console.log("chartConfig", chartConfig)
    console.log("ChartData", chartData)
    console.log("availableBooths", availableBooths)

    if (isLoadingAvailable) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>توزيع الأماكن المتاحة</CardTitle>
                    {/* <CardDescription>حسب المنطقة</CardDescription> */}
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">جاري التحميل...</p>
                </CardContent>
            </Card>
        )
    }

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>توزيع الأماكن المتاحة</CardTitle>
                    {/* <CardDescription>حسب المنطقة</CardDescription> */}
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">لا توجد بيانات متاحة</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>توزيع الأماكن المتاحة</CardTitle>
                {/* <CardDescription>حسب المنطقة</CardDescription> */}
            </CardHeader>
            <CardContent className="h-[200px]">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-full"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="booths"
                            nameKey="zone"
                            innerRadius={60}
                            strokeWidth={5}
                        >
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
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {/* {totalBooths.toLocaleString()} */}
                                                    {availableBooths["totalAvailableBooths"]}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    مكان متاح
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
