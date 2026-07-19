type ProgressDotsProps = {
  currentStep: number;
  totalSteps: number;
};

export function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <div
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
      className="flex items-center justify-center gap-1.5"
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <span
          key={i}
          className={`h-0.5 w-6 rounded-full transition-colors ${
            i < currentStep ? "bg-charcoal" : "bg-charcoal/15"
          }`}
        />
      ))}
    </div>
  );
}
