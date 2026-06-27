import axios from "axios";
import { ProcessingParams, ApiErrorResponse } from "../types";

const API_BASE_URL = "/api";

/**
 * Envia a planilha e os parâmetros para o backend processar.
 *
 * @param file - Arquivo da planilha selecionado pelo usuário
 * @param params - Parâmetros de percentuais (como strings do formulário)
 * @returns Blob do arquivo .xlsx processado para download
 * @throws Error com mensagem descritiva em caso de falha
 */
export async function processSpreadsheet(
  file: File,
  params: ProcessingParams
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  // Adiciona os parâmetros ao FormData
  formData.append("inpc", params.inpc);
  formData.append("ganhoReal", params.ganhoReal);
  formData.append("fgts", params.fgts);
  formData.append("inssPatronal", params.inssPatronal);
  formData.append("pis", params.pis);
  formData.append("fapRat", params.fapRat);

  try {
    const response = await axios.post(`${API_BASE_URL}/process`, formData, {
      responseType: "blob",
      // Não definir Content-Type manualmente — o browser define automaticamente
      // com o boundary correto para multipart/form-data
    });

    // Verifica se a resposta é realmente um xlsx e não um JSON de erro
    const contentType = String(response.headers["content-type"] || "");
    if (contentType.includes("application/json")) {
      // O backend retornou um JSON de erro mesmo com status 2xx
      const text = await (response.data as Blob).text();
      const parsed = JSON.parse(text) as ApiErrorResponse;
      throw new Error(parsed.error || "Erro ao processar a planilha.");
    }

    return response.data as Blob;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Tenta extrair a mensagem de erro do blob de resposta
      const errorMessage = await extractErrorMessage(error.response.data);
      throw new Error(errorMessage);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
    );
  }
}

/**
 * Extrai a mensagem de erro de uma resposta que pode ser Blob ou objeto.
 */
async function extractErrorMessage(data: unknown): Promise<string> {
  const fallback = "Erro ao processar a planilha. Tente novamente.";

  if (!data) return fallback;

  try {
    if (data instanceof Blob) {
      const text = await data.text();
      if (!text) return fallback;
      const parsed = JSON.parse(text) as ApiErrorResponse;
      return parsed.error || fallback;
    }

    if (typeof data === "object" && data !== null && "error" in data) {
      return String((data as ApiErrorResponse).error) || fallback;
    }

    if (typeof data === "string") {
      const parsed = JSON.parse(data) as ApiErrorResponse;
      return parsed.error || fallback;
    }
  } catch {
    // JSON.parse pode falhar se o body não for JSON válido
  }

  return fallback;
}

/**
 * Inicia o download automático de um Blob como arquivo.
 *
 * @param blob - Dados do arquivo
 * @param filename - Nome do arquivo para download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
