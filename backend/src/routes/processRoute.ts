import { Router, Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import * as XLSX from "xlsx";
import { SpreadsheetReaderService } from "../services/SpreadsheetReaderService";
import { CalculatorService } from "../services/CalculatorService";
import { SpreadsheetWriterService } from "../services/SpreadsheetWriterService";
import { ProcessingParams } from "../types";

const router = Router();

// Configuração do Multer: armazena o arquivo em memória (sem salvar em disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
  fileFilter: (_req, file, callback) => {
    const allowedExtensions = [".xls", ".xlsx", ".txt"];
    const ext = "." + file.originalname.split(".").pop()?.toLowerCase();
    if (allowedExtensions.includes(ext)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
});

// Instâncias dos serviços
const readerService = new SpreadsheetReaderService();
const calculatorService = new CalculatorService();
const writerService = new SpreadsheetWriterService();

/**
 * POST /api/diagnose
 * Rota de diagnóstico: lê a planilha e retorna os cabeçalhos exatos encontrados,
 * incluindo como cada um é normalizado, sem tentar validar ou processar.
 */
router.post(
  "/diagnose",
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof MulterError || err instanceof Error) {
        res.status(400).json({ error: err.message });
        return;
      }
      next();
    });
  },
  (req: Request, res: Response): void => {
    if (!req.file) {
      res.status(400).json({ error: "Nenhum arquivo enviado." });
      return;
    }
    try {
      const workbook = XLSX.read(req.file.buffer, { type: "buffer", raw: false });
      const sheetNames = workbook.SheetNames;
      const allSheetsHeaders: Record<string, { raw: string; json: string }[]> = {};

      for (const sheetName of sheetNames) {
        const ws = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<unknown[]>(ws, {
          header: 1,
          defval: "",
          raw: false,
        });
        const firstRow = ((data[0] as unknown[]) || []).map((cell) => ({
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
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  }
);

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
router.post(
  "/process",
  (req: Request, res: Response, next: NextFunction) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof MulterError) {
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
  },
  (req: Request, res: Response): void => {
    try {
      if (!req.file) {
        const contentType = req.headers["content-type"] || "";
        if (contentType.includes("multipart/form-data")) {
          res.status(400).json({
            error: "Formato de arquivo não suportado. Envie um arquivo .xls, .xlsx ou .txt.",
          });
        } else {
          res.status(400).json({
            error: "Nenhum arquivo foi enviado. Selecione uma planilha para processar.",
          });
        }
        return;
      }

      const params = extractAndValidateParams(req.body);

      const { rows, columnMap } = readerService.read(
        req.file.buffer,
        req.file.originalname
      );

      const processedRows = calculatorService.processRows(rows, columnMap, params);
      const outputBuffer = writerService.write(processedRows);

      const outputFilename = buildOutputFilename(req.file.originalname);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${outputFilename}"`);
      res.setHeader("Content-Length", outputBuffer.length);
      res.send(outputBuffer);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao processar a planilha.";
      res.status(400).json({ error: message });
    }
  }
);

function extractAndValidateParams(body: Record<string, unknown>): ProcessingParams {
  const fields: Array<{ key: keyof ProcessingParams; label: string }> = [
    { key: "inpc", label: "INPC" },
    { key: "ganhoReal", label: "Ganho Real" },
    { key: "fgts", label: "FGTS" },
    { key: "inssPatronal", label: "INSS Patronal" },
    { key: "pis", label: "PIS" },
    { key: "fapRat", label: "FAP/RAT" },
  ];

  const params: Partial<ProcessingParams> = {};
  const missingFields: string[] = [];

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
    throw new Error(
      `Os seguintes campos são obrigatórios e não foram informados: ${missingFields.join(", ")}.`
    );
  }

  return params as ProcessingParams;
}

function buildOutputFilename(originalName: string): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}_reajustado.xlsx`;
}

export default router;
