import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdminTestsStore } from "@/stores/admin-tests-store.tsx";
import { getAllTests } from "@/services/test-api.ts";
import type { AdminTest } from "@/data/admin-test-schema.ts";
import { startTestAttempt } from "@/services/test-attempt.ts";
import { useNavigate } from "react-router-dom";
import { useUserTestStore } from "@/stores/user-test-store.tsx";
import { HeroSection } from "@/components/dashboard/hero-section";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { useAuthStore } from "@/stores/auth-store";
import { DataTable } from "@/components/attempts-table/data-table";
import { columns } from "@/components/attempts/columns";
import { useTestAttemptsStore } from "@/stores/test-attempts-store";
import { getAttemptsByStudent } from "@/services/test-attempt";
import { useMemo } from "react";

export default function UserHome() {

    const navigate = useNavigate();

    const { adminTestsResponse, setAdminTestsResponse } = useAdminTestsStore();
    const { setUserTestResponse } = useUserTestStore();
    const { accessToken } = useAuthStore();
    const userId = typeof accessToken?.userId === 'number' ? accessToken.userId : undefined;
    console.log("testsResponse", adminTestsResponse);

    // Attempts table state and logic
    const [pageSize, setPageSize] = useState("3");
    const { attempts, loading, error, setAttempts } = useTestAttemptsStore();


    const fetchTests = async () => {
        const res = await getAllTests();
        console.log("res", res);
        setAdminTestsResponse(res);
    };

    useEffect(() => {
        fetchTests();
    }, []);

    // Fetch attempts data
    useEffect(() => {
        const fetchAttempts = async () => {
            if (userId) {
                const data = await getAttemptsByStudent(userId);
                setAttempts(data);
            }
        };
        fetchAttempts();
    }, [userId, setAttempts]);


    const [startedTest, setStartedTest] = useState<number | undefined>();
    async function handleStartTest(testId: number) {
        if (typeof userId !== 'number') {
            alert('تعذر تحديد المستخدم. الرجاء إعادة تسجيل الدخول.');
            return;
        }
        setStartedTest(testId);
        // Simulate navigation or test start
        setTimeout(() => { }, 1000);
        const test = await startTestAttempt(testId, userId);
        console.log("test", test);
        console.log("testId", testId);
        setUserTestResponse(test);
        navigate(`tests/${testId}/take/${test.id}`);
    }



    // Calculate total questions for a test
    const getTotalQuestions = (test: AdminTest) => {
        return test.sections.reduce((total, section) => {
            return total + section.questions.length;
        }, 0);
    };



    // Tab state for chart/table
    const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');



    return (
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Hero & Stats */}
                    <div className="lg:col-span-2 order-1 lg:order-1 space-y-6">
                        <HeroSection />
                        {/* Line Chart & Attempts Tabs */}
                        <Card className="md:h-60 lg:h-100 flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                                <div>
                                    <CardTitle>الإحصائيات والنتائج</CardTitle>
                                    <CardDescription>عرض الإحصائيات ومحاولات الاختبار الخاصة بك</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 bg-muted/40 rounded-full p-1 w-fit">
                                    <button
                                        className={`px-5 py-1.5 rounded-full font-medium transition-all text-sm focus:outline-none
                                            ${activeTab === 'chart' ? 'bg-primary text-white shadow' : 'text-foreground hover:bg-muted/70'}`}
                                        onClick={() => setActiveTab('chart')}
                                        type="button"
                                    >
                                        الإحصائيات
                                    </button>
                                    <button
                                        className={`px-5 py-1.5 rounded-full font-medium transition-all text-sm focus:outline-none
                                            ${activeTab === 'table' ? 'bg-primary text-white shadow' : 'text-foreground hover:bg-muted/70'}`}
                                        onClick={() => setActiveTab('table')}
                                        type="button"
                                    >
                                        المحاولات
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {/* Tab Content */}
                                {activeTab === 'chart' && (
                                    <ChartContainer config={{
                                        desktop: {
                                            label: "Desktop",
                                            color: "var(--chart-1)",
                                        },
                                        mobile: {
                                            label: "Mobile",
                                            color: "var(--chart-2)",
                                        },
                                    } satisfies ChartConfig}
                                        className="h-70 w-full">
                                        <LineChart
                                            accessibilityLayer
                                            data={[
                                                { month: "January", desktop: 186, mobile: 80 },
                                                { month: "February", desktop: 305, mobile: 200 },
                                                { month: "March", desktop: 237, mobile: 120 },
                                                { month: "April", desktop: 73, mobile: 190 },
                                                { month: "May", desktop: 209, mobile: 130 },
                                                { month: "June", desktop: 214, mobile: 140 },
                                            ]}
                                            margin={{
                                                left: 12,
                                                right: 12,
                                            }}
                                        >
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                tickFormatter={(value) => value.slice(0, 3)}
                                            />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                            <Line
                                                dataKey="desktop"
                                                type="monotone"
                                                stroke="var(--color-desktop)"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                            <Line
                                                dataKey="mobile"
                                                type="monotone"
                                                stroke="var(--color-mobile)"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ChartContainer>
                                )}
                                {activeTab === 'table' && (
                                    <div>
                                        {loading ? (
                                            <div className="text-center py-8">جاري التحميل...</div>
                                        ) : error ? (
                                            <div className="text-red-500 text-center py-8">{error}</div>
                                        ) : (
                                            <DataTable columns={columns} data={attempts} pageSize={parseInt(pageSize)} />
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Tests */}
                    <div className="lg:col-span-1 order-2 lg:order-2">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-foreground">الاختبارات المتاحة</h2>
                            <p className="text-muted-foreground mt-1">اختر الاختبار المناسب لك وابدأ الآن</p>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid gap-6 grid-cols-1">
                            {adminTestsResponse.map((test) => {
                                const isStarting = startedTest === test.id;
                                const totalQuestions = getTotalQuestions(test);

                                return (
                                    <Card
                                        key={test.id}
                                        className="relative group transition-all duration-300 hover:shadow-xl border-2 border-border hover:border-primary bg-card overflow-hidden"
                                    >

                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-xl font-bold text-foreground leading-tight" dir="rtl">
                                                    {test.title}
                                                </CardTitle>

                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Description */}
                                            <p className="text-sm text-muted-foreground min-h-[48px] leading-relaxed" dir="rtl">
                                                {test.description}
                                            </p>

                                            {/* Metadata */}
                                            <div className="flex items-center gap-4 text-xs text-foreground pt-2 border-t border-border">
                                                <div className="flex items-center gap-1.5" dir="rtl">
                                                    <Layers className="w-3.5 h-3.5 text-primary" />
                                                    <span className="font-medium">{test.sections.length} قسم</span>
                                                </div>
                                                <div className="flex items-center gap-1.5" dir="rtl">
                                                    <FileQuestion className="w-3.5 h-3.5 text-accent" />
                                                    <span className="font-medium">{totalQuestions} سؤال</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="space-y-2 pt-2">

                                                <button
                                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
                                                               shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
                                                               focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                                                               ${isStarting
                                                            ? 'bg-muted/50 cursor-not-allowed text-muted-foreground'
                                                            : 'bg-accent hover:bg-accent/90 text-accent-foreground'
                                                        }`}
                                                    onClick={() => handleStartTest(test.id)}
                                                    disabled={isStarting}
                                                    dir="rtl"
                                                >
                                                    {isStarting ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            جاري التحميل...
                                                        </span>
                                                    ) : (
                                                        'ابدأ الاختبار'
                                                    )}
                                                </button>
                                            </div>
                                        </CardContent>

                                        {/* Hover Effect Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300 pointer-events-none" />
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {adminTestsResponse.length === 0 && (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                                    <FileQuestion className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد اختبارات متاحة</h3>
                                <p className="text-muted-foreground">لم يتم العثور على اختبارات منشورة في الوقت الحالي</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}