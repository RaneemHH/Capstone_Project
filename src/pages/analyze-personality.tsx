import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAIResultByAttempt } from "@/services/ai-result-service";
import { useAIResultStore } from "@/stores/ai-result-store";

interface Job {
    id: number;
    url: string;
    jobSlug: string;
    jobTitle: string;
    companyName: string;
    companyLogo: string;
    jobIndustry: string[];
    jobType: string[];
    jobGeo: string;
    jobLevel: string;
    jobExcerpt: string;
    jobDescription: string;
    pubDate: string;
}

export default function AnalyzePersonality() {
    const location = useLocation();
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const { result, isLoading, error, setResult, setLoading, setError } = useAIResultStore();

    useEffect(() => {
        if (location.state?.attemptId) {
            setAttemptId(location.state.attemptId);
        }
    }, [location.state]);

    // Poll for AI results when attemptId is available
    useEffect(() => {
        console.log("Starting to poll for AI results for attemptId:", attemptId);
        if (!attemptId) return;

        setLoading(true);
        const pollInterval = setInterval(async () => {
            try {
                const data = await getAIResultByAttempt(attemptId);
                if (data) {
                    // Results are ready
                    setResult(data);
                    setLoading(false);
                    clearInterval(pollInterval);
                }
                // If null, continue polling
            } catch (err) {
                console.error("Error polling AI result:", err);
                setError("فشل في جلب نتائج التحليل");
                setLoading(false);
                clearInterval(pollInterval);
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval); // Cleanup on unmount
    }, [attemptId, setResult, setLoading, setError]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground">جاري تحليل شخصيتك...</h1>
                        <p className="text-xl text-muted-foreground">
                            يرجى الانتظار بينما نقوم بتحليل نتائجك
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-2 border-destructive/20">
                        <CardContent className="p-8 text-center">
                            <p className="text-destructive font-semibold">{error}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-background py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-foreground">تحليل الشخصية</h1>
                        <Card className="border-2 border-primary/20">
                            <CardContent className="p-8">
                                <p className="text-muted-foreground">
                                    لا توجد نتائج تحليل متاحة. يرجى إكمال اختبار أولاً.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    // Parse jobMatches JSON string and extract the jobs array
    let jobsArray: Job[] = [];
    try {
        const parsed = JSON.parse(result.jobMatches);
        jobsArray = parsed.jobs || [];
    } catch (e) {
        console.error("Error parsing jobMatches:", e);
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                        <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground">تحليل شخصيتك المهنية</h1>
                    <p className="text-xl text-muted-foreground">
                        بناءً على نتائج اختبار هولاند للشخصية المهنية
                    </p>
                </div>

                {/* AI Analysis Result */}
                <Card className="border-2 border-primary/20 shadow-xl">
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-6 h-6 text-primary" />
                                <h2 className="text-2xl font-bold text-foreground">التحليل بالذكاء الاصطناعي</h2>
                            </div>

                            <div className="space-y-4 text-right">
                                <div>
                                    <h3 className="text-lg font-semibold">رمز الشخصية:</h3>
                                    <p className="text-foreground">{result.personalityCode}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">توصيات مهنية:</h3>
                                    <p className="text-foreground whitespace-pre-wrap">{result.careerRecommendations}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">مسار التعلم:</h3>
                                    <p className="text-foreground whitespace-pre-wrap">{result.learningPath}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">تطابق الوظائف:</h3>
                                    <ul className="list-disc list-inside">
                                        {jobsArray.map((job, index) => (
                                            <li key={index} className="text-foreground">
                                                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    {job.jobTitle}
                                                </a> - {job.companyName} ({job.jobGeo})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">تم إرسال البريد الإلكتروني:</h3>
                                    <p className="text-foreground">{result.emailSent ? "نعم" : "لا"}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">تاريخ الإنشاء:</h3>
                                    <p className="text-foreground">{new Date(result.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        يمكنك رؤية التحليل أو النتائج لاحقاً في صفحة المحاولات
                    </p>
                </div>
            </div>
        </div>
    );
}