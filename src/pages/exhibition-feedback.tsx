import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Star, User, MessageSquare, ArrowRight, Plus } from "lucide-react";
import { exhibitionFeedbackService } from "@/services/exhibition-feedback-service";
import { exhibitionService } from "@/services/exhibitionService";
import { studentRegistrationService } from "@/services/student-registration-service";
import type { ExhibitionFeedbackResponse } from "@/types/exhibition-feedback";
import type { ExhibitionResponse } from "@/types/exhibition";
import type { StudentRegistrationResponse } from "@/types/student-registration";
import { toast } from "sonner";
import { SubmitFeedbackDialog } from "@/components/exhibition/submit-feedback-dialog";

export default function ExhibitionFeedback() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState<ExhibitionFeedbackResponse[]>([]);
    const [exhibition, setExhibition] = useState<ExhibitionResponse | null>(null);
    const [myRegistration, setMyRegistration] = useState<StudentRegistrationResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id) return;

        console.log('🔵 Starting to fetch data for exhibition:', id);

        try {
            setIsLoading(true);
            const [feedbacksData, exhibitionData, registrationsData] = await Promise.all([
                exhibitionFeedbackService.getFeedbackForExhibition(parseInt(id)),
                exhibitionService.getExhibitionById(parseInt(id)),
                studentRegistrationService.getStudentRegistrations(),
            ]);
            
            console.log('✅ Feedbacks loaded:', feedbacksData);
            console.log('✅ Exhibition loaded:', exhibitionData);
            console.log('✅ All registrations loaded:', registrationsData);
            
            setFeedbacks(feedbacksData);
            setExhibition(exhibitionData);
            
            // Find my registration for this exhibition
            const myReg = registrationsData.find(r => r.exhibitionId === parseInt(id));
            
            console.log('🔍 Looking for exhibition ID:', parseInt(id));
            console.log('🔍 Found registration:', myReg);
            
            setMyRegistration(myReg || null);
        } catch (error) {
            console.error('❌ Failed to fetch data:', error);
            toast.error("فشل في تحميل البيانات");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);

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

    // Student can submit feedback if:
    // 1. They attended the exhibition (status = ATTENDED and approved)
    // 2. OR the exhibition is completed (allow feedback submission)
    const canSubmitFeedback = 
        (myRegistration?.status === 'ATTENDED') &&
        (exhibition?.status === 'COMPLETED');

    // Debug logging
    console.log('My Registration:', myRegistration);
    console.log('Exhibition Status:', exhibition?.status);
    console.log('Can Submit Feedback:', canSubmitFeedback);
    console.log('Registration Status:', myRegistration?.status);
    console.log('Approved:', myRegistration?.approved);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto scrollbar-hide">
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">تقييمات المعرض</h1>
                            {exhibition && (
                                <p className="text-muted-foreground mt-1">{exhibition.title}</p>
                            )}
                        </div>
                    </div>

                    {/* Add Feedback Button - only for ATTENDED students */}
                    {canSubmitFeedback && (
                        <Button
                            onClick={() => setSubmitDialogOpen(true)}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            إضافة تقييم
                        </Button>
                    )}
                </div>

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
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <MessageSquare className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">لا توجد تقييمات بعد</h3>
                            <p className="text-muted-foreground text-center">
                                كن أول من يقيم هذا المعرض
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

            {/* Submit Feedback Dialog */}
            {id && (
                <SubmitFeedbackDialog
                    exhibitionId={parseInt(id)}
                    open={submitDialogOpen}
                    onOpenChange={setSubmitDialogOpen}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
