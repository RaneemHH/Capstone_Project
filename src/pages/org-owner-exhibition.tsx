
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Stepper from "@/components/exhibition/stepper";
import Municipality from "@/components/exhibition/view-municipalities";
import ManageParticipants from "@/components/exhibition/manage-participants";
import { ExhibitionConfirmedView } from "@/components/exhibition/exhibition-confirmed-view";
import { OrgExhibitionFeedbackView } from "@/components/exhibition/org-exhibition-feedback-view";
import ExhibitionRightPanel from "@/components/exhibition/exhibition-right-panel";
import { exhibitionService } from "@/services/exhibitionService";
import type { ExhibitionResponse, ExhibitionStatus } from "@/types/exhibition";
import { Loader2 } from "lucide-react";

const OrgOwnerExhibition = () => {
    const { id } = useParams<{ id: string }>();
    const [exhibition, setExhibition] = useState<ExhibitionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const totalSteps = 4;

    // Fetch exhibition data
    useEffect(() => {
        const fetchExhibition = async () => {
            if (!id) return;
            
            try {
                setIsLoading(true);
                const data = await exhibitionService.getExhibitionById(parseInt(id));
                setExhibition(data);
                
                // Set initial step based on exhibition status
                const initialStep = getInitialStepFromStatus(data.status);
                setCurrentStep(initialStep);
            } catch (error) {
                console.error('Failed to fetch exhibition:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExhibition();
    }, [id]);

    // Determine which step to show based on exhibition status
    const getInitialStepFromStatus = (status: ExhibitionStatus): number => {
        if (status === 'COMPLETED') {
            return 4; // Show step 4 for completed exhibitions (feedback)
        } else if (status === 'CONFIRMED' || status === 'ACTIVE') {
            return 3; // Show step 3 for confirmed exhibitions (financial & schedule)
        } else if (status === 'VENUE_APPROVED' || status === 'PLANNING') {
            return 2; // Show step 2 for venue approved or planning
        }
        return 1; // Default to step 1
    };

    // Determine if a step is enabled based on exhibition status
    const isStepEnabled = (step: number): boolean => {
        if (!exhibition) return step === 1;

        const status = exhibition.status;

        // Step 1 is always enabled
        if (step === 1) return true;

        // Step 2 is enabled when status is VENUE_APPROVED, PLANNING, CONFIRMED, ACTIVE, or COMPLETED
        if (step === 2) {
            return ['VENUE_APPROVED', 'PLANNING', 'CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(status);
        }

        // Step 3 is enabled when status is PLANNING (to confirm), CONFIRMED, ACTIVE, or COMPLETED
        if (step === 3) {
            return ['PLANNING', 'CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(status);
        }

        // Step 4 is enabled only when status is COMPLETED
        if (step === 4) {
            return status === 'COMPLETED';
        }

        return false;
    };

    const handleStepClick = (step: number) => {
        // Allow clicking only on enabled steps
        if (isStepEnabled(step)) {
            setCurrentStep(step);
        }
    };

    // Render step content dynamically based on currentStep
    const renderStepContent = () => {
        if (!exhibition) return null;

        switch (currentStep) {
            case 1:
                return <Municipality />;
            case 2:
                return <ManageParticipants />;
            case 3:
                return (
                    <ExhibitionConfirmedView
                        exhibitionId={parseInt(id!)}
                        exhibition={exhibition}
                    />
                );
            case 4:
                return <OrgExhibitionFeedbackView exhibitionId={parseInt(id!)} />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="mr-3 text-muted-foreground">جاري تحميل المعرض...</span>
            </div>
        );
    }

    if (!exhibition) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">لم يتم العثور على المعرض</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col scrollbar-hide">
            {/* Horizontal Stepper - Mobile/Tablet Only */}
            <div className="lg:hidden w-full bg-card p-4">
                <div className="flex items-center justify-center gap-0">
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                        <div key={step} className="flex items-center">
                            <button
                                onClick={() => handleStepClick(step)}
                                disabled={!isStepEnabled(step)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                                    step === currentStep
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : isStepEnabled(step)
                                        ? "bg-card text-foreground border-2 border-border hover:bg-muted cursor-pointer"
                                        : "bg-muted/50 text-muted-foreground border-2 border-border cursor-not-allowed opacity-50"
                                }`}
                            >
                                {step}
                            </button>
                            {step < totalSteps && (
                                <div className="w-10 h-0.5 bg-border" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div
                // initial={{ opacity: 0, scale: 0.95 }}
                // animate={{ opacity: 1, scale: 1 }}
                // transition={{ duration: 0.3, ease: "easeOut" }}
                dir="rtl"
                className="bg-card w-full relative flex flex-col lg:flex-row flex-1"
            >


                {/* Left Panel - Hidden on Mobile/Tablet */}
                <ExhibitionRightPanel currentStep={currentStep} />


                {/* Vertical Stepper - Desktop Only - Middle Position */}
                <div className="hidden lg:block absolute left-[70%] top-0 bottom-0 z-20">
                    <Stepper 
                        currentStep={currentStep} 
                        totalSteps={totalSteps}
                        isStepEnabled={isStepEnabled}
                        onStepClick={handleStepClick}
                    />
                </div>

                {/* Right Panel - Dynamic Content */}
                <div className="lg:w-[70%] w-full p-4 lg:p-6 flex flex-col overflow-y-auto scrollbar-hide">
                    {exhibition && renderStepContent()}
                </div>
            </div>
        </div>
    );
};

export default OrgOwnerExhibition;
