interface StepperProps {
    currentStep: number;
    totalSteps: number;
    isStepEnabled?: (step: number) => boolean;
    onStepClick?: (step: number) => void;
}

const Stepper = ({ currentStep, totalSteps, isStepEnabled, onStepClick }: StepperProps) => {
    const handleStepClick = (step: number) => {
        if (onStepClick && isStepEnabled && isStepEnabled(step)) {
            onStepClick(step);
        }
    };

    return (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col items-center gap-0">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
                const enabled = isStepEnabled ? isStepEnabled(step) : true;
                const isActive = step === currentStep;
                
                return (
                    <div key={step} className="flex flex-col items-center">
                        <button
                            onClick={() => handleStepClick(step)}
                            disabled={!enabled}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all z-10 ${
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : enabled
                                    ? "bg-card text-foreground border-2 border-border hover:bg-muted cursor-pointer"
                                    : "bg-muted/50 text-muted-foreground border-2 border-border cursor-not-allowed opacity-50"
                            }`}
                        >
                            {step}
                        </button>
                        {step < totalSteps && (
                            <div className="w-0.5 h-10 bg-border" />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Stepper;
