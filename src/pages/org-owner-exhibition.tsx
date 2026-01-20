
import { useState } from "react";
import { useParams } from "react-router-dom";
import Stepper from "@/components/exhibition/stepper";
import Municipality from "@/components/exhibition/municipality";
import ManageParticipants from "@/components/exhibition/manage-participants";

// import { NoneIcon, LightIcon, ModerateIcon, HeavyIcon } from "@/components/exhibition/activity-icon";
// import horseIllustration from "@/assets/horse-illustration.png";


// Mock municipalities data
// const municipalities = [
//     {
//         id: 1,
//         name: "بلدية بيروت",
//         location: "بيروت",
//         capacity: 500,
//         image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400&h=300&fit=crop",
//         gradient: "from-[hsl(239,84%,67%)] to-[hsl(230,94%,62%)]"
//     },
//     {
//         id: 2,
//         name: "بلدية طرابلس",
//         location: "طرابلس",
//         capacity: 400,
//         image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
//         gradient: "from-[hsl(200,84%,67%)] to-[hsl(190,94%,62%)]"
//     },
//     {
//         id: 3,
//         name: "بلدية صيدا",
//         location: "صيدا",
//         capacity: 350,
//         image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=300&fit=crop",
//         gradient: "from-[hsl(280,84%,67%)] to-[hsl(270,94%,62%)]"
//     },
//     {
//         id: 4,
//         name: "بلدية زحلة",
//         location: "البقاع",
//         capacity: 300,
//         image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=400&h=300&fit=crop",
//         gradient: "from-[hsl(160,84%,67%)] to-[hsl(150,94%,62%)]"
//     },
//     {
//         id: 5,
//         name: "بلدية جبيل",
//         location: "جبل لبنان",
//         capacity: 250,
//         image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop",
//         gradient: "from-[hsl(320,84%,67%)] to-[hsl(310,94%,62%)]"
//     },
//     {
//         id: 6,
//         name: "بلدية صور",
//         location: "الجنوب",
//         capacity: 280,
//         image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop",
//         gradient: "from-[hsl(40,84%,67%)] to-[hsl(30,94%,62%)]"
//     },
// ];

const OrgOwnerExhibition = () => {
    const [selectedOption, setSelectedOption] = useState<string>("light");
    const [currentStep, setCurrentStep] = useState<number>(1);
    const totalSteps = 4;

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
            case 4:
                return <div>Step 4 Content</div>;
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
                <div className="hidden lg:flex relative lg:w-[35%] bg-[var(--panel-bg)] p-6 lg:p-8 flex-col">

                    {/* Horse Illustration */}
                    <div className="mb-6 flex justify-center">
                        {/* <img
                        src={horseIllustration}
                        alt="Horse illustration"
                        className="w-40 h-auto"
                    /> */}
                    </div>

                    {/* Step Info */}
                    <div className="mb-6">
                        <p className="text-xs font-semibold text-primary tracking-wider mb-1">الخطوة 1</p>
                        <h2 className="text-xl font-bold text-foreground mb-4">اختيار البلدية</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            اختر البلدية التي ترغب في إقامة المعرض فيها. يمكنك البحث حسب الاسم أو تصفية النتائج حسب الموقع.
                        </p>
                    </div>

                    {/* Did You Know Section */}
                    <div className="mt-auto">
                        <p className="text-xs font-bold text-foreground tracking-wide mb-2">هل تعلم:</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                            يجب الحصول على موافقة البلدية قبل إقامة أي معرض عام. تأكد من تقديم الطلب قبل 30 يوماً على الأقل من تاريخ المعرض.
                        </p>
                        <p className="text-xs text-muted-foreground">
                            أسئلة؟{" "}
                            <a href="#" className="text-primary font-medium hover:underline">
                                تواصل مع خدمة العملاء.
                            </a>
                        </p>
                    </div>
                </div>

                {/* Vertical Stepper - Desktop Only - Middle Position */}
                <div className="hidden lg:block absolute left-[65%] top-0 bottom-0 z-20">
                    <Stepper currentStep={currentStep} totalSteps={totalSteps} />
                </div>

                {/* Right Panel - Dynamic Content */}
                <div className="lg:w-[65%] w-full p-6 lg:p-12 flex flex-col">
                    {renderStepContent()}
                </div>
            </div>
        </div>
    );
};

export default OrgOwnerExhibition;
