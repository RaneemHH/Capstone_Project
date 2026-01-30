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
        <div className="space-y-8">
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
        </div>
    );
}
