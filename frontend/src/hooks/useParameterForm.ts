import { useState, useCallback } from "react";
import { ProcessingParams, FormErrors } from "../types";

const INITIAL_PARAMS: ProcessingParams = {
  inpc: "",
  ganhoReal: "",
  fgts: "",
  inssPatronal: "",
  pis: "",
  fapRat: "",
};

const FIELD_LABELS: Record<keyof ProcessingParams, string> = {
  inpc: "INPC",
  ganhoReal: "Ganho Real",
  fgts: "FGTS",
  inssPatronal: "INSS Patronal",
  pis: "PIS",
  fapRat: "FAP/RAT",
};

/**
 * Hook que gerencia o estado e validação do formulário de parâmetros.
 */
export function useParameterForm() {
  const [params, setParams] = useState<ProcessingParams>(INITIAL_PARAMS);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = useCallback(
    (field: keyof ProcessingParams, value: string) => {
      setParams((prev) => ({ ...prev, [field]: value }));

      // Limpa o erro do campo quando o usuário começar a digitar
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  /**
   * Valida todos os campos do formulário.
   * @returns true se válido, false se houver erros
   */
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    for (const [key, label] of Object.entries(FIELD_LABELS) as Array<[keyof ProcessingParams, string]>) {
      const value = params[key];

      if (value === "" || value === null || value === undefined) {
        newErrors[key] = `${label} é obrigatório.`;
        isValid = false;
        continue;
      }

      const num = parseFloat(value);

      if (isNaN(num)) {
        newErrors[key] = `${label} deve ser um número válido.`;
        isValid = false;
        continue;
      }

      if (num < 0) {
        newErrors[key] = `${label} não pode ser negativo.`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [params]);

  const reset = useCallback(() => {
    setParams(INITIAL_PARAMS);
    setErrors({});
  }, []);

  return {
    params,
    errors,
    handleChange,
    validate,
    reset,
  };
}
