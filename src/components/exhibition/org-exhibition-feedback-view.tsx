import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Star, User, MessageSquare } from "lucide-react";
import { exhibitionFeedbackService } from "@/services/exhibition-feedback-service";
import { useDashboardStore } from "@/stores/dashboard-store";
import type { ExhibitionFeedbackResponse } from "@/types/exhibition-feedback";
import { toast } from "sonner";
import { ChartRadarGridCircle } from "@/components/charts/chart-radar-grid-circle";
import { getMergedFeedbacks, getMockDataForExhibition } from "@/mockDataForCharts/mockExhibitionDetails";

interface OrgExhibitionFeedbackViewProps {
    exhibitionId: number;
}

export function OrgExhibitionFeedbackView({ exhibitionId }: OrgExhibitionFeedbackViewProps) {
    const [feedbacks, setFeedbacks] = useState<ExhibitionFeedbackResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { feedbackAnalytics, isLoadingFeedback, fetchFeedbackAnalytics } = useDashboardStore();

    const fetchFeedbacks = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await exhibitionFeedbackService.getFeedbackForExhibition(exhibitionId);
            const mergedFeedbacks = getMergedFeedbacks(data, exhibitionId);
            setFeedbacks(mergedFeedbacks);
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
            toast.error("فشل في تحميل التقييمات");
        } finally {
            setIsLoading(false);
        }
    }, [exhibitionId]);

    useEffect(() => {
        fetchFeedbacks();
        fetchFeedbackAnalytics(exhibitionId);
    }, [fetchFeedbacks, fetchFeedbackAnalytics, exhibitionId]);

    const getAverageRating = () => {
        if (feedbacks.length === 0) return 0;
        const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
        return (sum / feedbacks.length).toFixed(1);
    };

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
            />
        ));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Tabs defaultValue="comments" className="w-full" dir="rtl">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="comments">التعليقات</TabsTrigger>
                <TabsTrigger value="analytics">الإحصائيات</TabsTrigger>
            </TabsList>

            <TabsContent value="comments" className="space-y-8 mt-6">
                {/* Centered Rating Display */}
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="text-7xl font-bold mb-4">
                        {getAverageRating()}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                        {getRatingStars(Math.round(parseFloat(getAverageRating())))}
                    </div>
                    <div className="text-muted-foreground text-sm">
                        ({feedbacks.length} تقييمات)
                    </div>
                </div>

                {/* Most Liked Comments Header */}
                <div>
                    <h3 className="text-xl font-semibold">التعليقات الأكثر إعجاباً</h3>
                </div>

                {/* Feedbacks List */}
                {feedbacks.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">لا توجد تقييمات بعد</h3>
                            <p className="text-muted-foreground text-center">
                                لم يقم أي طالب بتقييم المعرض حتى الآن
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {feedbacks.map((feedback) => (
                            <Card key={feedback.id}>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                                    <User className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold">
                                                        {feedback.studentName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {getRatingStars(feedback.rating)}
                                            </div>
                                        </div>
                                        
                                        {feedback.comments && (
                                            <div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {feedback.comments}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-6">
                {isLoadingFeedback ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : !feedbackAnalytics || feedbackAnalytics.totalFeedbacks === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">لا توجد تقييمات بعد</h3>
                            <p className="text-muted-foreground text-center">
                                لم يقم أي طالب بتقييم المعرض حتى الآن
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            إجمالي التقييمات
                                        </div>
                                        <div className="text-3xl font-bold">
                                            {feedbackAnalytics.totalFeedbacks}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            متوسط التقييم
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-3xl font-bold">
                                                {feedbackAnalytics.averageRating.toFixed(1)}
                                            </span>
                                            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Radar Chart - Use mock data if available for satisfaction metrics */}
                        {(() => {
                            const mockData = getMockDataForExhibition(exhibitionId);
                            const radarData = mockData?.radarChartData || Object.entries(feedbackAnalytics.feedbacksByRating).map(([rating, count]) => ({
                                category: `${rating} نجوم`,
                                value: count
                            }));
                            const radarTitle = mockData?.radarChartData ? "مقاييس الرضا" : "توزيع التقييمات";
                            const radarDescription = mockData?.radarChartData ? "تقييم جودة المعرض في مختلف الجوانب" : "عدد الطلاب لكل تقييم";
                            
                            return (
                                <ChartRadarGridCircle
                                    data={radarData}
                                    title={radarTitle}
                                    description={radarDescription}
                                    footerText={`إجمالي ${feedbackAnalytics.totalFeedbacks} تقييم`}
                                    dataKey="value"
                                    categoryKey="category"
                                />
                            );
                        })()}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
