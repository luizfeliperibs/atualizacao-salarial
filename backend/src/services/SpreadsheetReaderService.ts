import * as XLSX from "xlsx";
import { ColumnMap, ReadSpreadsheetResult, SpreadsheetRow } from "../types";
import { mapColumns, getMissingColumns } from "../utils/columnMapper";

/**
 * Número máximo de linhas iniciais a escanear procurando o cabeçalho.
 * Planilhas com logo, título ou linhas em branco no topo geralmente têm
 * os cabeçalhos dentro das primeiras 10 linhas.
 */
const MAX_HEADER_SCAN_ROWS = 15;

/**
 * Serviço responsável pela leitura de planilhas.
 *
 * Suporta: .xls, .xlsx, .txt (estruturado em colunas/tab-separated)
 * Detecta automaticamente a linha de cabeçalho, mesmo quando há
 * títulos, logos ou linhas em branco antes dos dados.
 */
export class SpreadsheetReaderService {
  /**
   * Lê uma planilha a partir de um Buffer e retorna os dados e o mapeamento de colunas.
   *
   * @param buffer - Conteúdo do arquivo
   * @param originalName - Nome original do arquivo (para detectar extensão)
   * @throws Error com mensagem descritiva se o arquivo ou colunas forem inválidos
   */
  read(buffer: Buffer, originalName: string): ReadSpreadsheetResult {
    const workbook = this.parseWorkbook(buffer, originalName);
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new Error("A planilha enviada não contém nenhuma aba.");
    }

    const worksheet = workbook.Sheets[firstSheetName];

    // Lê todas as linhas como array de arrays para escanear
    const allRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
      header: 1,
      defval: "",
      raw: false,
    });

    if (allRows.length === 0) {
      throw new Error("A planilha não contém dados.");
    }

    // Detecta em qual linha estão os cabeçalhos reais
    const headerRowIndex = this.detectHeaderRow(allRows);

    if (headerRowIndex === -1) {
      throw new Error(
        "Não foi possível localizar os cabeçalhos obrigatórios na planilha. " +
        "Verifique se a planilha possui as colunas: Salário (ou Salário Base), " +
        "Gratificação (ou Gratificações), Anuênio."
      );
    }

    // Extrai os cabeçalhos da linha detectada
    const headerRow = allRows[headerRowIndex] as unknown[];
    const headers = headerRow
      .map((cell) => String(cell ?? "").trim())
      .filter((h) => h !== "");

    console.log(`[INFO] Cabeçalhos encontrados na linha ${headerRowIndex + 1}:`, headers);

    // Realiza o mapeamento de colunas
    const rawColumnMap = mapColumns(headers);

    // Verifica colunas obrigatórias
    const missing = getMissingColumns(rawColumnMap);
    if (missing.length > 0) {
      throw new Error(
        `Coluna(s) obrigatória(s) não encontrada(s): ${missing.join(", ")}. ` +
        `Verifique se a planilha possui as colunas: Salário (ou Salário Base), ` +
        `Gratificação (ou Gratificações), Anuênio.`
      );
    }

    const columnMap: ColumnMap = {
      salario: rawColumnMap["salario"] as string,
      gratificacao: rawColumnMap["gratificacao"] as string,
      anuenio: rawColumnMap["anuenio"] as string,
    };

    // Lê os dados usando a linha de cabeçalho correta
    // header: headerRowIndex + 1 (1-indexed no XLSX) indica qual linha usar como cabeçalho
    const rows = XLSX.utils.sheet_to_json<SpreadsheetRow>(worksheet, {
      defval: "",
      raw: false,
      range: headerRowIndex, // começa a ler a partir da linha de cabeçalho
    });

    if (rows.length === 0) {
      throw new Error("A planilha não contém registros de dados abaixo dos cabeçalhos.");
    }

    return { rows, columnMap };
  }

  /**
   * Escaneia as primeiras linhas da planilha para detectar qual linha contém
   * os cabeçalhos das colunas obrigatórias (Salário, Gratificação, Anuênio).
   *
   * @param allRows - Todas as linhas da planilha como array de arrays
   * @returns Índice (0-based) da linha de cabeçalho, ou -1 se não encontrado
   */
  private detectHeaderRow(allRows: unknown[][]): number {
    const limit = Math.min(allRows.length, MAX_HEADER_SCAN_ROWS);

    for (let i = 0; i < limit; i++) {
      const row = allRows[i] as unknown[];
      if (!row || row.length === 0) continue;

      // Converte as células desta linha para strings e tenta mapear
      const cellStrings = row
        .map((cell) => String(cell ?? "").trim())
        .filter((s) => s !== "");

      if (cellStrings.length === 0) continue;

      const mapping = mapColumns(cellStrings);
      const missing = getMissingColumns(mapping);

      // Se todas as colunas obrigatórias foram encontradas, esta é a linha de cabeçalho
      if (missing.length === 0) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Interpreta o buffer como workbook XLSX.
   */
  private parseWorkbook(buffer: Buffer, originalName: string): XLSX.WorkBook {
    const extension = originalName.split(".").pop()?.toLowerCase();

    try {
      if (extension === "txt") {
        return XLSX.read(buffer, { type: "buffer", raw: false });
      }
      return XLSX.read(buffer, { type: "buffer", raw: false });
    } catch {
      throw new Error(
        "Não foi possível ler o arquivo. " +
        "Certifique-se de que é uma planilha válida nos formatos .xls, .xlsx ou .txt."
      );
    }
  }
}
