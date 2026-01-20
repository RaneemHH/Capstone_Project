interface StepperProps {
    currentStep: number;
    totalSteps: number;
}

const Stepper = ({ currentStep, totalSteps }: StepperProps) => {
    return (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col items-center gap-0">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex flex-col items-center">
                    <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all z-10 ${step === currentStep
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-card text-[var(--step-inactive)] border-2 border-[var(--step-line)]"
                            }`}
                    >
                        {step}
                    </div>
                    {step < totalSteps && (
                        <div className="w-0.5 h-10 bg-[var(--step-line)]" />
                    )}
                </div>
            ))}
        </div>
    );
};

export default Stepper;
