
import { useState } from "react";
import Stepper from "@/components/exhibition/stepper";
import Municipality from "@/components/exhibition/municipality";
import ManageParticipants from "@/components/exhibition/manage-participants";
import ExhibitionRightPanel from "@/components/exhibition/exhibition-right-panel";
import { Outlet } from "react-router-dom";





const OrgOwnerExhibition = () => {
    const [selectedOption, setSelectedOption] = useState<string>("light");
    const [currentStep, setCurrentStep] = useState<number>(2);
    const totalSteps = 3;

    const handleNext = () => {
        // Handle navigation to next step
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        // Handle navigation to previous step
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Render step content dynamically based on currentStep
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <Municipality />;
            case 2:
                return <ManageParticipants onNext={handleNext} onPrevious={handlePrevious} />;
            case 3:
                return <div>Step 3 Content</div>;
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Horizontal Stepper - Mobile/Tablet Only */}
            <div className="lg:hidden w-full bg-card p-4">
                <div className="flex items-center justify-center gap-0">
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                        <div key={step} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === currentStep
                                    ? "bg-blue-500 text-white shadow-md"
                                    : "bg-gray-50 text-[var(--step-inactive)] border-2 border-[var(--step-line)]"
                                    }`}
                            >
                                {step}
                            </div>
                            {step < totalSteps && (
                                <div className="w-10 h-0.5 bg-[var(--step-line)]" />
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
                className="bg-card w-full overflow-hidden relative flex flex-col lg:flex-row flex-1"
            >


                {/* Left Panel - Hidden on Mobile/Tablet */}
                <ExhibitionRightPanel currentStep={currentStep} />


                {/* Vertical Stepper - Desktop Only - Middle Position */}
                <div className="hidden lg:block absolute left-[70%] top-0 bottom-0 z-20">
                    <Stepper currentStep={currentStep} totalSteps={totalSteps} />
                </div>

                {/* Right Panel - Dynamic Content */}
                <div className="lg:w-[70%] w-full p-6 lg:p-12 flex flex-col">
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
};

export default OrgOwnerExhibition;
