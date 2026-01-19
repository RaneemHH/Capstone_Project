import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { StepIndicator } from "@/components/test-creation/step-indicator.tsx";
import { Step1GeneralInfo } from "@/components/test-creation/step1-generalInfo.tsx";
// import { Step2Traits, type Trait } from "@/components/test-creation/step2-traits.tsx";
// import {
//   Step3Sections,
//   type Section,
// } from "@/components/test-creation/step3-sections.tsx";
import { Step4Preview } from "@/components/test-creation/step4-preview.tsx";
import UpdateTest from "./update-test";

interface Step1Data {
  title: string;
  description: string;
}

export default function CreateTest() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [step1Data, setStep1Data] = useState<Step1Data>({
    title: "",
    description: "",
  });
//   const [step2Data, setStep2Data] = useState<Trait[]>([]);
//   const [step3Data, setStep3Data] = useState<Section[]>([]);

  const steps = [
    "المعلومات العامة",
    "الخصائص",
    "الأقسام والأسئلة",
    "المعاينة والنشر",
  ];

  const handleNext = (): void => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoToStep = (step: number): void => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePublish = (): void => {
    // Handle publish logic here
    console.log("Publishing test:", {
      generalInfo: step1Data,
    //   traits: step2Data,
    //   sections: step3Data,
    });
    alert("تم نشر العرض بنجاح!");
  };

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return step1Data.title.trim() !== "";
      case 2:
        return true; // Traits are optional
      case 3:
        return true; // Can proceed even without sections
      default:
        return true;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Step Indicator */}
      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        steps={steps}
      />

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && (
          <Step1GeneralInfo
            data={step1Data}
            onChange={setStep1Data}
          />
        )}
        {/* {currentStep === 2 && (
          <Step2Traits
            data={step2Data}
            onChange={setStep2Data}
          />
        )} */
      
        }
        {currentStep === 3 && (
        //   <Step3Sections
        //     data={step3Data}
        //     onChange={setStep3Data}
        //   />
        <UpdateTest/>
        )}
        {currentStep === 4 && (
          <Step4Preview
            generalInfo={step1Data}
            // traits={step2Data}
            traits={[]}
            sections={[]}
            onEdit={handleGoToStep}
            onPublish={handlePublish}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        // <div className="flex items-center justify-between gap-4 pb-8">
        <div className="flex items-center justify-center gap-4 pt-6">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            size="lg"
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border text-muted-foreground hover:border-border/80 hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
           <button
            type="submit"
            className="px-12 py-3 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-full hover:from-accent/90 hover:to-accent/70 transition-all shadow-md hover:shadow-lg"
          >
            إرسال
          </button>
          <Button
            onClick={handleNext}
            disabled={!canGoNext()}
            size="lg"
            className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border text-muted-foreground hover:border-border/80 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}