import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star, User, MessageSquare } from "lucide-react";
import { exhibitionFeedbackService } from "@/services/exhibition-feedback-service";
import type { ExhibitionFeedbackResponse } from "@/types/exhibition-feedback";
import { toast } from "sonner";

interface OrgExhibitionFeedbackViewProps {
    exhibitionId: number;
}

export function OrgExhibitionFeedbackView({ exhibitionId }: OrgExhibitionFeedbackViewProps) {
    const [feedbacks, setFeedbacks] = useState<ExhibitionFeedbackResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFeedbacks = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await exhibitionFeedbackService.getFeedbackForExhibition(exhibitionId);
            setFeedbacks(data);
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
            toast.error("فشل في تحميل التقييمات");
        } finally {
            setIsLoading(false);
        }
    }, [exhibitionId]);

    useEffect(() => {
        fetchFeedbacks();
    }, [fetchFeedbacks]);

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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">تقييمات المعرض</h2>
                <p className="text-muted-foreground mt-1">
                    آراء الطلاب حول المعرض
                </p>
            </div>

            {/* Summary */}
            <Card className="bg-primary/5">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">
                                إجمالي التقييمات
                            </div>
                            <div className="text-3xl font-bold">
                                {feedbacks.length} تقييم
                            </div>
                        </div>
                        <div className="text-center md:text-right">
                            <div className="text-sm text-muted-foreground mb-1">
                                متوسط التقييم
                            </div>
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <span className="text-4xl font-bold">
                                    {getAverageRating()}
                                </span>
                                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-lg">
                                                    {feedback.studentName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(feedback.createdAt).toLocaleDateString('en-US')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {getRatingStars(feedback.rating)}
                                        </div>
                                    </div>
                                    
                                    {feedback.comments && (
                                        <div className="pr-14">
                                            <p className="text-muted-foreground leading-relaxed">
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
        </div>
    );
}
