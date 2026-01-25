import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { exhibitionFeedbackService } from "@/services/exhibition-feedback-service";
import { toast } from "sonner";

interface SubmitFeedbackDialogProps {
    exhibitionId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function SubmitFeedbackDialog({
    exhibitionId,
    open,
    onOpenChange,
    onSuccess,
}: SubmitFeedbackDialogProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("الرجاء اختيار تقييم");
            return;
        }

        try {
            setIsSubmitting(true);
            await exhibitionFeedbackService.submitFeedback(
                exhibitionId,
                rating,
                comments || undefined
            );
            toast.success("تم إرسال التقييم بنجاح");
            setRating(0);
            setComments("");
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            toast.error("فشل في إرسال التقييم");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setRating(0);
            setHoveredRating(0);
            setComments("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-right">إضافة تقييم</DialogTitle>
                    <DialogDescription className="text-right">
                        شاركنا رأيك في المعرض
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Rating Stars */}
                    <div className="space-y-2">
                        <Label className="text-right block">التقييم *</Label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 ${
                                            star <= (hoveredRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center text-sm text-muted-foreground">
                                {rating} من 5 نجوم
                            </p>
                        )}
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                        <Label htmlFor="comments" className="text-right block">
                            التعليقات (اختياري)
                        </Label>
                        <Textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="اكتب تعليقك هنا..."
                            className="text-right min-h-[120px]"
                            rows={5}
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || rating === 0}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                جاري الإرسال...
                            </>
                        ) : (
                            "إرسال التقييم"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
