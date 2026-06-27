"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpreadsheetReaderService = void 0;
const XLSX = __importStar(require("xlsx"));
const columnMapper_1 = require("../utils/columnMapper");
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
class SpreadsheetReaderService {
    /**
     * Lê uma planilha a partir de um Buffer e retorna os dados e o mapeamento de colunas.
     *
     * @param buffer - Conteúdo do arquivo
     * @param originalName - Nome original do arquivo (para detectar extensão)
     * @throws Error com mensagem descritiva se o arquivo ou colunas forem inválidos
     */
    read(buffer, originalName) {
        const workbook = this.parseWorkbook(buffer, originalName);
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
            throw new Error("A planilha enviada não contém nenhuma aba.");
        }
        const worksheet = workbook.Sheets[firstSheetName];
        // Lê todas as linhas como array de arrays para escanear
        const allRows = XLSX.utils.sheet_to_json(worksheet, {
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
            throw new Error("Não foi possível localizar os cabeçalhos obrigatórios na planilha. " +
                "Verifique se a planilha possui as colunas: Salário (ou Salário Base), " +
                "Gratificação (ou Gratificações), Anuênio.");
        }
        // Extrai os cabeçalhos da linha detectada
        const headerRow = allRows[headerRowIndex];
        const headers = headerRow
            .map((cell) => String(cell ?? "").trim())
            .filter((h) => h !== "");
        console.log(`[INFO] Cabeçalhos encontrados na linha ${headerRowIndex + 1}:`, headers);
        // Realiza o mapeamento de colunas
        const rawColumnMap = (0, columnMapper_1.mapColumns)(headers);
        // Verifica colunas obrigatórias
        const missing = (0, columnMapper_1.getMissingColumns)(rawColumnMap);
        if (missing.length > 0) {
            throw new Error(`Coluna(s) obrigatória(s) não encontrada(s): ${missing.join(", ")}. ` +
                `Verifique se a planilha possui as colunas: Salário (ou Salário Base), ` +
                `Gratificação (ou Gratificações), Anuênio.`);
        }
        const columnMap = {
            salario: rawColumnMap["salario"],
            gratificacao: rawColumnMap["gratificacao"],
            anuenio: rawColumnMap["anuenio"],
        };
        // Lê os dados usando a linha de cabeçalho correta
        // header: headerRowIndex + 1 (1-indexed no XLSX) indica qual linha usar como cabeçalho
        const rows = XLSX.utils.sheet_to_json(worksheet, {
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
    detectHeaderRow(allRows) {
        const limit = Math.min(allRows.length, MAX_HEADER_SCAN_ROWS);
        for (let i = 0; i < limit; i++) {
            const row = allRows[i];
            if (!row || row.length === 0)
                continue;
            // Converte as células desta linha para strings e tenta mapear
            const cellStrings = row
                .map((cell) => String(cell ?? "").trim())
                .filter((s) => s !== "");
            if (cellStrings.length === 0)
                continue;
            const mapping = (0, columnMapper_1.mapColumns)(cellStrings);
            const missing = (0, columnMapper_1.getMissingColumns)(mapping);
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
    parseWorkbook(buffer, originalName) {
        const extension = originalName.split(".").pop()?.toLowerCase();
        try {
            if (extension === "txt") {
                return XLSX.read(buffer, { type: "buffer", raw: false });
            }
            return XLSX.read(buffer, { type: "buffer", raw: false });
        }
        catch {
            throw new Error("Não foi possível ler o arquivo. " +
                "Certifique-se de que é uma planilha válida nos formatos .xls, .xlsx ou .txt.");
        }
    }
}
exports.SpreadsheetReaderService = SpreadsheetReaderService;
