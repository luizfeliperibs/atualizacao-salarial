/** Parâmetros de percentuais enviados ao backend */
export interface ProcessingParams {
  inpc: string;
  ganhoReal: string;
  fgts: string;
  inssPatronal: string;
  pis: string;
  fapRat: string;
}

/** Erros de validação por campo do formulário */
export type FormErrors = Partial<Record<keyof ProcessingParams, string>>;

/** Resposta de erro da API */
export interface ApiErrorResponse {
  error: string;
}

/** Estado do upload do arquivo */
export type UploadState = "idle" | "selected";

/** Estado geral da aplicação */
export type AppState = "input" | "processing" | "success" | "error";
