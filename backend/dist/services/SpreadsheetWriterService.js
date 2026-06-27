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
exports.SpreadsheetWriterService = void 0;
const XLSX = __importStar(require("xlsx"));
const numberUtils_1 = require("../utils/numberUtils");
/**
 * Nomes das colunas calculadas que devem ter arredondamento de 2 casas decimais na saída.
 */
const CALCULATED_COLUMNS = [
    "Salário Reajustado",
    "Gratificação Reajustada",
    "Anuênio Reajustado",
    "Base Férias",
    "Férias (1/12)",
    "Terço Constitucional",
    "Décimo Terceiro (1/12)",
    "Base Encargos",
    "FGTS",
    "INSS Patronal",
    "FAP/RAT",
    "PIS",
    "Total Encargos",
    "Total Geral",
];
/**
 * Serviço responsável pela geração da planilha Excel de saída.
 *
 * Responsabilidades:
 * - Aplicar arredondamento de 2 casas decimais nos valores calculados (apenas na saída)
 * - Preservar todas as colunas originais
 * - Gerar o arquivo .xlsx como Buffer
 */
class SpreadsheetWriterService {
    /**
     * Gera um Buffer contendo o arquivo .xlsx processado.
     *
     * @param rows - Linhas processadas (originais + calculadas)
     * @returns Buffer do arquivo .xlsx
     */
    write(rows) {
        // Aplica arredondamento de 2 casas decimais apenas nas colunas calculadas
        const roundedRows = rows.map((row) => this.applyRounding(row));
        // Cria a planilha a partir do array de objetos
        const worksheet = XLSX.utils.json_to_sheet(roundedRows);
        // Aplica formatação numérica de moeda nas colunas calculadas
        this.applyNumberFormat(worksheet, roundedRows);
        // Cria o workbook e adiciona a aba
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Planilha Reajustada");
        // Gera o arquivo como Buffer
        const buffer = XLSX.write(workbook, {
            type: "buffer",
            bookType: "xlsx",
        });
        return Buffer.from(buffer);
    }
    /**
     * Aplica arredondamento de 2 casas decimais nas colunas calculadas.
     * Os valores originais da planilha são mantidos sem alteração.
     */
    applyRounding(row) {
        const result = { ...row };
        for (const col of CALCULATED_COLUMNS) {
            if (typeof result[col] === "number") {
                result[col] = (0, numberUtils_1.round2)(result[col]);
            }
        }
        return result;
    }
    /**
     * Aplica formato numérico de moeda (2 casas decimais) nas células calculadas.
     * Isso garante que o Excel exiba os valores formatados corretamente.
     */
    applyNumberFormat(worksheet, rows) {
        if (rows.length === 0)
            return;
        const headers = Object.keys(rows[0]);
        const calculatedIndexes = CALCULATED_COLUMNS.map((col) => headers.indexOf(col)).filter((idx) => idx !== -1);
        const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
        for (const colIndex of calculatedIndexes) {
            for (let rowIndex = range.s.r + 1; rowIndex <= range.e.r; rowIndex++) {
                const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                const cell = worksheet[cellAddress];
                if (cell) {
                    cell.t = "n"; // tipo numérico
                    cell.z = '#,##0.00'; // formato monetário
                }
            }
        }
    }
}
exports.SpreadsheetWriterService = SpreadsheetWriterService;
