/**
 * Tipos compartilhados entre os serviços do backend.
 */

/** Parâmetros de percentuais fornecidos pelo usuário (em %, ex: 8.5 para 8,5%) */
export interface ProcessingParams {
  inpc: number;
  ganhoReal: number;
  fgts: number;
  inssPatronal: number;
  pis: number;
  fapRat: number;
}

/** Linha original lida da planilha (chave = nome da coluna, valor = qualquer tipo) */
export type SpreadsheetRow = Record<string, unknown>;

/** Linha processada com os campos calculados adicionados */
export interface ProcessedRow extends SpreadsheetRow {
  "Salário Reajustado": number;
  "Gratificação Reajustada": number;
  "Anuênio Reajustado": number;
  "Base Férias": number;
  "Férias (1/12)": number;
  "Terço Constitucional": number;
  "Décimo Terceiro (1/12)": number;
  "Base Encargos": number;
  FGTS: number;
  "INSS Patronal": number;
  "FAP/RAT": number;
  PIS: number;
  "Total Encargos": number;
  "Total Geral": number;
}

/** Resultado da leitura da planilha */
export interface ReadSpreadsheetResult {
  rows: SpreadsheetRow[];
  /** Mapeamento: nome canonical -> nome real encontrado na planilha */
  columnMap: ColumnMap;
}

/** Mapeamento dos nomes canônicos para os nomes reais das colunas na planilha */
export interface ColumnMap {
  salario: string;
  gratificacao: string;
  anuenio: string;
}
