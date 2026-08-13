type StepIndicatorProps = {
  current: number;
  steps?: string[];
};

const defaultSteps = ["Odeeffannoo", "Oomisha", "Karoora", "Xumura"];

export default function StepIndicator({ current, steps = defaultSteps }: StepIndicatorProps) {
  const progress = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;

  return (
    <div className="step-indicator" aria-label={`Step ${current + 1} of ${steps.length}`}>
      <div className="step-track"><span style={{ width: `${progress}%` }} /></div>
      <div className="step-points">
        {steps.map((step, index) => (
          <div className={index < current ? "step-point done" : index === current ? "step-point active" : "step-point"} key={step}>
            <span>{index < current ? "✓" : index + 1}</span>
            <small>{step}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
