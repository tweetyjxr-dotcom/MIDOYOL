import React from "react";

const STEPS = [
  {
    number: 1,
    title: "Registration",
    description: "Account",
  },
  {
    number: 2,
    title: "Choose",
    description: "Program",
  },
  {
    number: 3,
    title: "Documents",
    description: "Required files",
  },
  {
    number: 4,
    title: "Payment",
    description: "Coming soon",
  },
];

export default function ProgressTracker({
  currentStage = 1,
}) {
  return (
    <div className="progress-tracker">
      {STEPS.map((step, index) => {
        const completed = step.number < currentStage;
        const active = step.number === currentStage;
        const paymentComingSoon = step.number === 4;

        return (
          <React.Fragment key={step.number}>
            <div
              className={`progress-step ${
                completed ? "completed" : ""
              } ${active ? "active" : ""} ${
                paymentComingSoon ? "payment-step" : ""
              }`}
            >
              <div className="progress-circle">
                {completed ? "✓" : step.number}
              </div>

              <div className="progress-step-content">
                <strong>{step.title}</strong>
                <span>{step.description}</span>
              </div>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`progress-line ${
                  completed ? "completed" : ""
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
                 }
