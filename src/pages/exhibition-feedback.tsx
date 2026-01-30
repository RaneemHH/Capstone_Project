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
            <div className="space-y-8 p-4 md:p-6 lg:p-8">
                {/* Header with Back Button and Add Feedback */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        {exhibition && (
                            <h1 className="text-2xl font-bold">{exhibition.title}</h1>
                        )}
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
                                كن أول من يقيم هذا المعرض
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
