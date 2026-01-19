import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {  FileQuestion, Layers } from "lucide-react";
import {useEffect, useState} from "react";
import {useAdminTestsStore} from "@/stores/admin-tests-store.tsx";
import {getAllTests} from "@/services/test-api.ts";
import type {AdminTest} from "@/data/admin-test-schema.ts";
import {startTestAttempt} from "@/services/test-attempt.ts";
import {useNavigate} from "react-router-dom";
import {useUserTestStore} from "@/stores/user-test-store.tsx";
import { HeroSection } from "@/components/dashboard/hero-section";

export default function UserHome() {

    const navigate = useNavigate();

    const { adminTestsResponse, setAdminTestsResponse } = useAdminTestsStore();
    const { setUserTestResponse } = useUserTestStore();

    console.log("testsResponse",adminTestsResponse);


    const fetchTests = async () => {
        const res = await getAllTests();
        console.log("res", res);
        setAdminTestsResponse(res);
    };

    useEffect(() => {
        fetchTests();
    }, []);


    const [startedTest, setStartedTest] = useState<number | undefined>();
    async function handleStartTest(testId: number) {
        setStartedTest(testId);
        // Simulate navigation or test start
        setTimeout(() => {
        }, 1000);
        const test = await startTestAttempt(testId,4);

        console.log("test",test);
        console.log("testId",testId);
        setUserTestResponse(test);

        navigate(`tests/${testId}/take/${test.id}`)

    }

 

    // Calculate total questions for a test
    const getTotalQuestions = (test:AdminTest) => {
        return test.sections.reduce((total, section) => {
            return total + section.questions.length;
        }, 0);
    };



    return (
        <div className="min-h-screen bg-background">
            {/* Header Section */}
            <HeroSection/>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground">الاختبارات المتاحة</h2>
                    <p className="text-muted-foreground mt-1">اختر الاختبار المناسب لك وابدأ الآن</p>
                </div>

                {/* Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    );
}