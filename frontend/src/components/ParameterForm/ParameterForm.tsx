import React from "react";
import { ProcessingParams, FormErrors } from "../../types";

interface ParameterFormProps {
  params: ProcessingParams;
  errors: FormErrors;
  onChange: (field: keyof ProcessingParams, value: string) => void;
  disabled?: boolean;
}

interface FieldConfig {
  key: keyof ProcessingParams;
  label: string;
  placeholder: string;
  helpText?: string;
}

const FIELDS: FieldConfig[] = [
  { key: "inpc", label: "INPC", placeholder: "Ex: 5.32", helpText: "Índice Nacional de Preços ao Consumidor" },
  { key: "ganhoReal", label: "Ganho Real", placeholder: "Ex: 2.0", helpText: "Percentual de ganho real acima do INPC" },
  { key: "fgts", label: "FGTS", placeholder: "Ex: 8.0", helpText: "Fundo de Garantia do Tempo de Serviço" },
  { key: "inssPatronal", label: "INSS Patronal", placeholder: "Ex: 20.0", helpText: "Contribuição patronal ao INSS" },
  { key: "pis", label: "PIS", placeholder: "Ex: 1.0", helpText: "Programa de Integração Social" },
  { key: "fapRat", label: "FAP/RAT", placeholder: "Ex: 3.0", helpText: "Fator Acidentário de Prevenção / Risco Ambiental do Trabalho" },
];

/**
 * Componente de formulário com os 6 campos de percentuais.
 * Aceita apenas valores numéricos decimais.
 * Exibe erros de validação por campo.
 */
export const ParameterForm: React.FC<ParameterFormProps> = ({
  params,
  errors,
  onChange,
  disabled = false,
}) => {
  const inpc = parseFloat(params.inpc) || 0;
  const ganhoReal = parseFloat(params.ganhoReal) || 0;
  const totalReajuste = inpc + ganhoReal;
  const hasReajuste = params.inpc !== "" && params.ganhoReal !== "";

  const handleChange = (key: keyof ProcessingParams) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Permite dígitos, ponto e vírgula (converte vírgula para ponto)
    const value = e.target.value.replace(",", ".");
    onChange(key, value);
  };

  return (
    <div>
      {hasReajuste && totalReajuste > 0 && (
        <div className="reajuste-preview animate-slide-down">
          <span className="reajuste-preview__label">Total do reajuste salarial:</span>
          <span className="reajuste-preview__value">{totalReajuste.toFixed(2)}%</span>
        </div>
      )}

      <div className="parameter-form__grid">
        {FIELDS.map((field) => (
          <FormField
            key={field.key}
            config={field}
            value={params[field.key]}
            error={errors[field.key]}
            onChange={handleChange(field.key)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

/* --- Sub-componente FormField --- */
interface FormFieldProps {
  config: FieldConfig;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  config,
  value,
  error,
  onChange,
  disabled,
}) => {
  const inputId = `field-${config.key}`;
  const hasError = Boolean(error);

  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-field__label">
        {config.label}
        <span className="form-field__label-required" title="Obrigatório">*</span>
      </label>
      <div className="form-field__input-wrapper">
        <input
          id={inputId}
          type="number"
          step="0.01"
          min="0"
          className={`form-field__input${hasError ? " form-field__input--error" : ""}`}
          placeholder={config.placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          aria-invalid={hasError}
          title={config.helpText}
        />
        <span className="form-field__suffix">%</span>
      </div>
      {hasError && (
        <span id={`${inputId}-error`} className="form-field__error animate-slide-down" role="alert">
          ⚠ {error}
        </span>
      )}
    </div>
  );
};
