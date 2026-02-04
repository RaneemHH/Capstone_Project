import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function StepIndicator({
  currentStep,
  totalSteps,
  steps,
}: StepIndicatorProps) {
  return (
    <div className="mb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Container for circles and connectors */}
        <div className="relative">
          {/* Layer 1: Circles + Connectors (horizontally aligned) */}
          <div className="flex items-center justify-between">
            {steps.map((_, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              const isLast = stepNumber === totalSteps;

              // Connector is active (green) if this step is completed
              const isConnectorActive =
                stepNumber < currentStep;

              return (
                <div
                  key={stepNumber}
                  className="flex items-center"
                  style={{
                    flex: isLast ? "0 0 auto" : "1 1 0%",
                  }}
                >
                  {/* Circle - sits above connector with z-index */}
                  <div
                    className={`
                      relative z-10
                      w-10 h-10 md:w-12 md:h-12
                      rounded-full
                      flex items-center justify-center
                      text-sm font-semibold
                      transition-all duration-300
                      shrink-0
                      ${
                        isCompleted
                          ? "bg-accent text-accent-foreground border-4 border-accent"
                          : isCurrent
                            ? "bg-accent text-accent-foreground border-4 border-accent ring-4 ring-accent/20"
                            : "bg-card text-muted-foreground border-4 border-card ring-2 ring-border"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check
                        className="w-4 h-4 md:w-5 md:h-5"
                        strokeWidth={3}
                      />
                    ) : (
                      stepNumber
                    )}
                  </div>

                  {/* Connector Line - directly touches circle edge (no gap) */}
                  {!isLast && (
                    <div
                      className="flex-1 flex items-center relative"
                      style={{ zIndex: 0 }}
                    >
                      <div
                        className={`
                          w-full h-0.5
                          transition-all duration-500 ease-in-out
                          ${isConnectorActive ? "bg-accent" : "bg-border"}
                        `}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Layer 2: Labels (positioned below circles) */}
          <div className="flex items-start justify-between mt-3">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isCurrent = stepNumber === currentStep;
              const isLast = stepNumber === totalSteps;

              return (
                <div
                  key={`label-${stepNumber}`}
                  className="flex items-center"
                  style={{
                    flex: isLast ? "0 0 auto" : "1 1 0%",
                  }}
                >
                  {/* Label */}
                  <p
                    className={`
                      text-xs md:text-sm
                      text-center
                      max-w-[80px] md:max-w-[100px]
                      leading-tight
                      shrink-0
                      ${isCurrent ? "text-foreground font-bold" : "text-muted-foreground"}
                    `}
                    style={{ width: "40px" }}
                  >
                    {step}
                  </p>

                  {/* Spacer to match connector */}
                  {!isLast && <div className="flex-1"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Text */}
        <p className="text-center text-sm md:text-base text-muted-foreground font-medium mt-6">
          الخطوة {currentStep} من {totalSteps}
        </p>
      </div>
    </div>
  );
}