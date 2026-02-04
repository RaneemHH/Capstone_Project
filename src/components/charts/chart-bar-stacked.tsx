"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

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
import { useDashboardStore } from "@/stores/dashboard-store"

export const description = "إحصائيات المشاركة حسب نوع المؤسسة والحالة"

const chartConfig = {
    invited: {
        label: "مدعو",
        color: "var(--chart-1)",
    },
    registered: {
        label: "مسجل",
        color: "var(--chart-2)",
    },
    proposalSubmitted: {
        label: "تم تقديم مقترح",
        color: "var(--chart-2)",
    },
    confirmed: {
        label: "مؤكد",
        color: "var(--chart-3)",
    },
    finalized: {
        label: "نهائي",
        color: "var(--chart-4)",
    },
    attended: {
        label: "حضر",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function ChartBarStacked() {
    const { participationStats, isLoadingStats } = useDashboardStore()

    const chartData = useMemo(() => {
        if (!participationStats) return []

        return [
            {
                category: "المدارس",
                invited: participationStats.schools.invited,
                registered: participationStats.schools.registered,
                finalized: participationStats.schools.finalized,
                attended: participationStats.schools.attended,
            },
            {
                category: "الجامعات",
                invited: participationStats.universities.invited,
                registered: participationStats.universities.registered,
                confirmed: participationStats.universities.confirmed,
                finalized: participationStats.universities.finalized,
                attended: participationStats.universities.attended,
            },
            {
                category: "مزودي الأنشطة",
                invited: participationStats.activityProviders.invited,
                proposalSubmitted: participationStats.activityProviders.proposalSubmitted,
                finalized: participationStats.activityProviders.finalized,
                attended: participationStats.activityProviders.attended,
            },
        ]
    }, [participationStats])

    if (isLoadingStats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>إحصائيات المشاركة</CardTitle>
                    <CardDescription>جاري التحميل...</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                    <div className="text-muted-foreground">جاري تحميل البيانات...</div>
                </CardContent>
            </Card>
        )
    }

    if (!participationStats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>إحصائيات المشاركة</CardTitle>
                    <CardDescription>لا توجد بيانات متاحة</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                    <div className="text-muted-foreground">لا توجد إحصائيات لعرضها</div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>إحصائيات المشاركة</CardTitle>
                <CardDescription>توزيع المشاركين حسب الحالة</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 20, right: 50, left: -50, bottom: 5 }}
                        barSize={32}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="category"
                            type="category"
                            tickLine={false}
                            tickMargin={80}
                            axisLine={false}
                            width={140}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[200px]"
                                    formatter={(value, name) => (
                                        <div className="flex items-center gap-2 w-full">
                                            <div
                                                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                                                style={{
                                                    backgroundColor: `var(--color-${name})`,
                                                }}
                                            />
                                            <span className="text-muted-foreground mr-1">
                                                {chartConfig[name as keyof typeof chartConfig]?.label || name}:
                                            </span>
                                            <span className="font-mono font-medium tabular-nums text-foreground mr-auto">
                                                {value}
                                            </span>
                                        </div>
                                    )}
                                />
                            }
                            cursor={false}
                        />
                        <Bar
                            dataKey="invited"
                            stackId="a"
                            fill="var(--color-invited)"
                            radius={[4, 0, 0, 4]}
                        />
                        <Bar
                            dataKey="registered"
                            stackId="a"
                            fill="var(--color-registered)"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="proposalSubmitted"
                            stackId="a"
                            fill="var(--color-proposalSubmitted)"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="confirmed"
                            stackId="a"
                            fill="var(--color-confirmed)"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="finalized"
                            stackId="a"
                            fill="var(--color-finalized)"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="attended"
                            stackId="a"
                            fill="var(--color-attended)"
                            radius={[0, 4, 4, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

