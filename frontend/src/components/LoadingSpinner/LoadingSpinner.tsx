import React, { useEffect, useState } from "react";

const STEPS = [
  "Lendo a planilha...",
  "Aplicando reajuste salarial...",
  "Calculando encargos...",
  "Gerando planilha de saída...",
];

/**
 * Spinner de carregamento com animação sequencial de etapas.
 * Simula o progresso visual durante o processamento no backend.
 */
export const LoadingSpinner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-spinner">
      <div className="spinner" aria-label="Processando..." />

      <div>
        <h2 className="loading-spinner__title">Processando planilha</h2>
        <p className="loading-spinner__subtitle">
          Aguarde enquanto realizamos os cálculos trabalhistas
        </p>
      </div>

      <div className="loading-spinner__steps" role="status" aria-live="polite">
        {STEPS.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div
              key={step}
              className={`loading-step${isActive ? " loading-step--active" : ""}${isDone ? " loading-step--done" : ""}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="loading-step__dot" />
              {isDone ? `✓ ${step}` : step}
            </div>
          );
        })}
      </div>
    </div>
  );
};
