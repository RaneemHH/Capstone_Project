// import { useLocation, useNavigate } from "react-router-dom";
// import { Card, CardContent } from "@/components/ui/card";
// import {  Trophy } from "lucide-react";
// import {  useEffect, useState } from "react";
// // import { triggerAIAnalysis } from "@/services/test-attempt";
// // import { useAIAnalysisStore } from "@/stores/ai-analysis-store";

// interface TestResult {
//     firstMetric: string;
//     secondMetric: string;
//     thirdMetric: string;
//     metricScores: Record<string, number>;
// }

// export default function UserTestResult() {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const [result, setResult] = useState<TestResult | null>(null);

//     useEffect(() => {
//         if (location.state?.personalityResult) {
//             setResult(location.state.personalityResult);
//         }
//         // if (location.state?.attemptId) {
//         //     setAttemptId(location.state.attemptId);
//         // }
//     }, [location.state]);

//     if (!result) {
//         return (
//             <div className="min-h-screen bg-background flex items-center justify-center">
//                 <Card className="max-w-md">
//                     <CardContent className="p-12 text-center">
//                         <p className="text-muted-foreground">جاري تحميل النتائج...</p>
//                     </CardContent>
//                 </Card>
//             </div>
//         );
//     }

//     // Calculate total and percentages
//     const totalScore = Object.values(result.metricScores).reduce((sum, score) => sum + score, 0);
    
//     const getPercentage = (score: number) => {
//         if (totalScore === 0) return 0;
//         return Math.round((score / totalScore) * 100);
//     };

//     const letterData = [
//         { 
//             letter: result.firstMetric, 
//             score: result.metricScores[result.firstMetric] || 0,
//             gradient: "from-primary to-blue-500"
//         },
//         { 
//             letter: result.secondMetric, 
//             score: result.metricScores[result.secondMetric] || 0,
//             gradient: "from-accent to-orange-500"
//         },
//         { 
//             letter: result.thirdMetric, 
//             score: result.metricScores[result.thirdMetric] || 0,
//             gradient: "from-muted to-green-500"
//         }
//     ];

//     return (
//         <div className="min-h-screen bg-background py-12 px-4">
//             <div className="max-w-4xl mx-auto space-y-8">
//                 {/* Success Header */}
//                 <div className="text-center space-y-4">
//                     <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
//                         <Trophy className="w-12 h-12 text-accent" />
//                     </div>
//                     <h1 className="text-4xl font-bold text-foreground">تم إتمام الاختبار بنجاح!</h1>
//                     <p className="text-xl text-muted-foreground">إليك نتائج اختبار الشخصية</p>
//                 </div>

//                 {/* Three Letters Display */}
//                 <Card className="border-2 border-primary/20 shadow-xl">
//                     <CardContent className="p-8">
//                         <div className="flex justify-center gap-6 mb-8">
//                             {letterData.map((data, index) => (
//                                 <div 
//                                     key={index}
//                                     className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${data.gradient} flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 animate-in fade-in zoom-in`}
//                                     style={{ animationDelay: `${index * 100}ms` }}
//                                 >
//                                     <span className="text-5xl font-bold text-white">{data.letter}</span>
//                                 </div>
//                             ))}
//                         </div>

//                         {/* Score Sliders */}
//                         <div className="space-y-6">
//                             {letterData.map((data, index) => {
//                                 const percentage = getPercentage(data.score);
//                                 return (
//                                     <div 
//                                         key={index}
//                                         className="space-y-2 animate-in slide-in-from-right"
//                                         style={{ animationDelay: `${(index + 3) * 100}ms` }}
//                                     >
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-lg font-bold text-foreground flex items-center gap-2">
//                                                 <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${data.gradient} flex items-center justify-center`}>
//                                                     <span className="text-white font-bold">{data.letter}</span>
//                                                 </div>
//                                                 النوع {data.letter}
//                                             </span>
//                                             <span className="text-2xl font-bold text-foreground">
//                                                 {percentage}%
//                                             </span>
//                                         </div>
//                                         <div className="relative h-4 bg-secondary/30 rounded-full overflow-hidden">
//                                             <div 
//                                                 className={`h-full rounded-full bg-gradient-to-r ${data.gradient} transition-all duration-1000 ease-out`}
//                                                 style={{ width: `${percentage}%` }}
//                                             />
//                                         </div>
//                                         <p className="text-sm text-muted-foreground text-right">
//                                             النتيجة: {data.score} من {totalScore}
//                                         </p>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Action Buttons */}
//                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                     <button
//                         onClick={() => navigate("/dashboard/analyze-personality")}
//                         className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
//                     >
//                         تحليل شخصيتك
//                     </button>
                    
                  
//                 </div>

                
//             </div>
//         </div>
//     );
// }
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { triggerAIAnalysis } from "@/services/test-attempt";
import { useAIAnalysisStore } from "@/stores/ai-analysis-store";
import { toast } from "sonner";

interface TestResult {
    firstMetric: string;
    secondMetric: string;
    thirdMetric: string;
    metricScores: Record<string, number>;
}

export default function UserTestResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState<TestResult | null>(null);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const { setAnalysis, setLoading: setAILoading, setError, setProcessing } = useAIAnalysisStore();

    useEffect(() => {
        if (location.state?.personalityResult) {
            setResult(location.state.personalityResult);
            
            // Log scoring details for verification
            const personalityResult = location.state.personalityResult;
            const totalScore = Object.values(personalityResult.metricScores).reduce((sum: number, score: number) => sum + score, 0);
            
            console.log("=== Test Result Scoring Details ===");
            console.log("Individual Metric Scores:", personalityResult.metricScores);
            console.log("Total Score:", totalScore);
            console.log("Top 3 Metrics:", {
                first: personalityResult.firstMetric,
                second: personalityResult.secondMetric,
                third: personalityResult.thirdMetric
            });
            console.log("Score Breakdown:");
            Object.entries(personalityResult.metricScores).forEach(([metric, score]) => {
                const percentage = ((score as number) / totalScore * 100).toFixed(1);
                console.log(`  ${metric}: ${score} points (${percentage}%)`);
            });
            console.log("===================================");
        }
        if (location.state?.attemptId) {
            setAttemptId(location.state.attemptId);
        }
    }, [location.state]);

    const handleAnalyzeClick = async () => {
        if (!attemptId) {
            toast.error("لا يوجد معرف محاولة متاح");
            return;
        }

        try {
            setAILoading(true);
            setProcessing(true);
            console.log("Triggering AI analysis for attemptId:", attemptId);
            const analysisResponse = await triggerAIAnalysis(attemptId);
            setAnalysis(analysisResponse);
            console.log("AI analysis triggered:", analysisResponse);
            
            if (analysisResponse.success) {
                toast.success(analysisResponse.message);
                navigate(`/dashboard/${attemptId}/analyze-personality`, { state: { attemptId } });
            } else {
                toast.error(analysisResponse.message || "فشل في تحليل الشخصية");
            }
        } catch (error) {
            console.error("Failed to trigger AI analysis:", error);
            setError("فشل في تحليل الشخصية بواسطة الذكاء الاصطناعي");
            toast.error("فشل في تحليل الشخصية بواسطة الذكاء الاصطناعي");
        } finally {
            setAILoading(false);
        }
    };

    if (!result) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">جاري تحميل النتائج...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Calculate total and percentages
    const totalScore = Object.values(result.metricScores).reduce((sum, score) => sum + score, 0);
    
    const getPercentage = (score: number) => {
        if (totalScore === 0) return 0;
        return Math.round((score / totalScore) * 100);
    };

    // Get all metrics sorted by score
    const allMetrics = Object.entries(result.metricScores)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    
    const gradients = [
        "from-primary to-blue-500",
        "from-accent to-orange-500",
        "from-purple-500 to-pink-500",
        "from-green-500 to-emerald-500",
        "from-yellow-500 to-amber-500",
        "from-red-500 to-rose-500"
    ];
    
    const letterData = allMetrics.map(([letter, score], index) => ({
        letter,
        score,
        gradient: gradients[index] || "from-gray-500 to-slate-500"
    }));

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Success Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
                        <Trophy className="w-12 h-12 text-accent" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground">تم إتمام الاختبار بنجاح!</h1>
                    <p className="text-xl text-muted-foreground">إليك نتائج اختبار الشخصية</p>
                </div>

                {/* Three Letters Display */}
                <Card className="border-2 border-primary/20 shadow-xl">
                    <CardContent className="p-8">
                        <div className="flex justify-center gap-6 mb-8 flex-wrap">
                            {letterData.slice(0, 3).map((data, index) => (
                                <div 
                                    key={index}
                                    className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${data.gradient} flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 animate-in fade-in zoom-in`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <span className="text-5xl font-bold text-white">{data.letter}</span>
                                </div>
                            ))}
                        </div>

                        {/* Score Sliders for all 6 metrics */}
                        <div className="space-y-6">
                            {letterData.map((data, index) => {
                                const percentage = getPercentage(data.score);
                                return (
                                    <div 
                                        key={index}
                                        className="space-y-2 animate-in slide-in-from-right"
                                        style={{ animationDelay: `${(index + 3) * 100}ms` }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-foreground flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${data.gradient} flex items-center justify-center`}>
                                                    <span className="text-white font-bold">{data.letter}</span>
                                                </div>
                                                النوع {data.letter}
                                            </span>
                                            <span className="text-2xl font-bold text-foreground">
                                                {percentage}%
                                            </span>
                                        </div>
                                        <div className="relative h-4 bg-secondary/30 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full bg-gradient-to-r ${data.gradient} transition-all duration-1000 ease-out`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleAnalyzeClick}
                        className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        تحليل شخصيتك
                    </button>
                    
                  
                </div>
                    {/* Note for user */}
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        يمكنك رؤية التحليل أو النتائج لاحقاً في صفحة المحاولات
                    </p>
                </div>
                
            </div>
        </div>
    );
}