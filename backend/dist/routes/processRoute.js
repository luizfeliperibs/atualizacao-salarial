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
const express_1 = require("express");
const multer_1 = __importStar(require("multer"));
const XLSX = __importStar(require("xlsx"));
const SpreadsheetReaderService_1 = require("../services/SpreadsheetReaderService");
const CalculatorService_1 = require("../services/CalculatorService");
const SpreadsheetWriterService_1 = require("../services/SpreadsheetWriterService");
const router = (0, express_1.Router)();
// Configuração do Multer: armazena o arquivo em memória (sem salvar em disco)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // Limite de 10MB
    },
    fileFilter: (_req, file, callback) => {
        const allowedExtensions = [".xls", ".xlsx", ".txt"];
        const ext = "." + file.originalname.split(".").pop()?.toLowerCase();
        if (allowedExtensions.includes(ext)) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
});
// Instâncias dos serviços
const readerService = new SpreadsheetReaderService_1.SpreadsheetReaderService();
const calculatorService = new CalculatorService_1.CalculatorService();
const writerService = new SpreadsheetWriterService_1.SpreadsheetWriterService();
/**
 * POST /api/diagnose
 * Rota de diagnóstico: lê a planilha e retorna os cabeçalhos exatos encontrados,
 * incluindo como cada um é normalizado, sem tentar validar ou processar.
 */
router.post("/diagnose", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer_1.MulterError || err instanceof Error) {
            res.status(400).json({ error: err.message });
            return;
        }
        next();
    });
}, (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: "Nenhum arquivo enviado." });
        return;
    }
    try {
        const workbook = XLSX.read(req.file.buffer, { type: "buffer", raw: false });
        const sheetNames = workbook.SheetNames;
        const allSheetsHeaders = {};
        for (const sheetName of sheetNames) {
            const ws = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                defval: "",
                raw: false,
            });
            const firstRow = (data[0] || []).map((cell) => ({
                raw: String(cell),
                json: JSON.stringify(String(cell)),
            }));
            allSheetsHeaders[sheetName] = firstRow;
        }
        res.json({
            sheetNames,
            firstSheetName: sheetNames[0],
            headers: allSheetsHeaders,
        });
    }
    catch (e) {
        res.status(500).json({ error: String(e) });
    }
});
/**
 * POST /api/process
 *
 * Recebe:
 * - Arquivo multipart (campo "file")
 * - Parâmetros de percentuais no body (campos de texto)
 *
 * Retorna:
 * - Arquivo .xlsx processado como download
 * - Ou JSON com erro descritivo
 */
router.post("/process", (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer_1.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({ error: "O arquivo enviado excede o limite de 10MB." });
                return;
            }
            res.status(400).json({ error: `Erro no upload: ${err.message}` });
            return;
        }
        if (err instanceof Error) {
            res.status(400).json({ error: err.message });
            return;
        }
        next();
    });
}, (req, res) => {
    try {
        if (!req.file) {
            const contentType = req.headers["content-type"] || "";
            if (contentType.includes("multipart/form-data")) {
                res.status(400).json({
                    error: "Formato de arquivo não suportado. Envie um arquivo .xls, .xlsx ou .txt.",
                });
            }
            else {
                res.status(400).json({
                    error: "Nenhum arquivo foi enviado. Selecione uma planilha para processar.",
                });
            }
            return;
        }
        const params = extractAndValidateParams(req.body);
        const { rows, columnMap } = readerService.read(req.file.buffer, req.file.originalname);
        const processedRows = calculatorService.processRows(rows, columnMap, params);
        const outputBuffer = writerService.write(processedRows);
        const outputFilename = buildOutputFilename(req.file.originalname);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename="${outputFilename}"`);
        res.setHeader("Content-Length", outputBuffer.length);
        res.send(outputBuffer);
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Ocorreu um erro inesperado ao processar a planilha.";
        res.status(400).json({ error: message });
    }
});
function extractAndValidateParams(body) {
    const fields = [
        { key: "inpc", label: "INPC" },
        { key: "ganhoReal", label: "Ganho Real" },
        { key: "fgts", label: "FGTS" },
        { key: "inssPatronal", label: "INSS Patronal" },
        { key: "pis", label: "PIS" },
        { key: "fapRat", label: "FAP/RAT" },
    ];
    const params = {};
    const missingFields = [];
    for (const { key, label } of fields) {
        const raw = body[key];
        if (raw === undefined || raw === null || raw === "") {
            missingFields.push(label);
            continue;
        }
        const value = Number(raw);
        if (isNaN(value)) {
            throw new Error(`O campo "${label}" deve ser um número válido.`);
        }
        params[key] = value;
    }
    if (missingFields.length > 0) {
        throw new Error(`Os seguintes campos são obrigatórios e não foram informados: ${missingFields.join(", ")}.`);
    }
    return params;
}
function buildOutputFilename(originalName) {
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    return `${baseName}_reajustado.xlsx`;
}
exports.default = router;
