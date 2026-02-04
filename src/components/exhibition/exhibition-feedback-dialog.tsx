import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star, User, MessageSquare } from "lucide-react";
import { exhibitionFeedbackService } from "@/services/exhibition-feedback-service";
import type { ExhibitionFeedbackResponse } from "@/types/exhibition-feedback";
import { toast } from "sonner";

interface ExhibitionFeedbackDialogProps {
    exhibitionId: number | null;
    exhibitionTitle: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExhibitionFeedbackDialog({
    exhibitionId,
    exhibitionTitle,
    open,
    onOpenChange,
}: ExhibitionFeedbackDialogProps) {
    const [feedbacks, setFeedbacks] = useState<ExhibitionFeedbackResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchFeedbacks = useCallback(async () => {
        if (!exhibitionId) return;

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
        if (open && exhibitionId) {
            fetchFeedbacks();
        }
    }, [open, exhibitionId, fetchFeedbacks]);

    const getAverageRating = () => {
        if (feedbacks.length === 0) return 0;
        const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
        return (sum / feedbacks.length).toFixed(1);
    };

    const getRatingStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
            />
        ));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-right">تقييمات المعرض</DialogTitle>
                    <DialogDescription className="text-right">
                        {exhibitionTitle}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary */}
                        <Card className="bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">
                                            إجمالي التقييمات
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {feedbacks.length} تقييم
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground mb-1">
                                            متوسط التقييم
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl font-bold">
                                                {getAverageRating()}
                                            </span>
                                            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feedbacks List */}
                        {feedbacks.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>لا توجد تقييمات بعد</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {feedbacks.map((feedback) => (
                                    <Card key={feedback.id}>
                                        <CardContent className="pt-6">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold">
                                                                {feedback.studentName}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {new Date(feedback.createdAt).toLocaleDateString('en-US')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {getRatingStars(feedback.rating)}
                                                    </div>
                                                </div>

                                                {feedback.comments && (
                                                    <div className="pr-12">
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
                )}
            </DialogContent>
        </Dialog>
    );
}
