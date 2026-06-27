"use strict";
/**
 * Mapeador de colunas da planilha.
 *
 * Permite localizar colunas por nome, ignorando maiúsculas/minúsculas,
 * espaços extras, variações de acentuação e sufixos comuns como (R$) e (%).
 *
 * Isso garante que planilhas com pequenas variações no cabeçalho
 * sejam processadas corretamente.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapColumns = mapColumns;
exports.getMissingColumns = getMissingColumns;
/**
 * Variações aceitas para cada coluna canônica.
 *
 * IMPORTANTE: As variações aqui NÃO devem incluir sufixos como (R$) ou (%)
 * pois esses são removidos automaticamente pela função normalizeHeader().
 * Adicione novas variações aqui conforme necessário.
 */
const COLUMN_VARIANTS = {
    salario: [
        // Nomes simples
        "salario",
        "sal",
        "sal.",
        // Com "base"
        "salario base",
        "salario basico",
        // Vencimentos
        "vencimento",
        "vencimento basico",
        "vencimento base",
        "venc",
        "venc.",
        // Inglês / abreviações
        "salary",
        "wage",
    ],
    gratificacao: [
        // Singular
        "gratificacao",
        "gratificacao de funcao",
        // Plural (planilhas reais frequentemente usam plural)
        "gratificacoes",
        "gratifs",
        // Abreviações
        "gratif",
        "gratif.",
        "grat",
        "grat.",
    ],
    anuenio: [
        "anuenio",
        "anuenios",
        // Tempo de serviço
        "adicional por tempo de servico",
        "adicional tempo servico",
        "ats",
        "adicional de tempo de servico",
        "adicional por tempo de service",
        // Triênio / quinquênio (variações comuns)
        "trienio",
        "quinquenio",
        "adicional tempo",
    ],
};
/**
 * Normaliza um cabeçalho de coluna para comparação:
 * 1. Substitui quebras de linha (\n, \r) por espaço (cabeçalhos Excel com wrap)
 * 2. Remove sufixos entre parênteses, ex: "(R$)", "(%)", "(R$ mil)"
 * 3. Remove outros caracteres de controle
 * 4. Remove diacríticos (acentos)
 * 5. Converte para minúsculas
 * 6. Remove espaços extras nas pontas e colapsa múltiplos espaços
 */
function normalizeHeader(value) {
    return value
        .replace(/[\r\n\t]+/g, " ") // quebras de linha → espaço
        .replace(/\(.*?\)/g, "") // remove tudo entre parênteses: (R$), (%), etc.
        .replace(/[\x00-\x1F\x7F]/g, "") // remove outros caracteres de controle
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // remove diacríticos (acentos)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " "); // colapsa espaços múltiplos
}
/**
 * Dado o conjunto de cabeçalhos reais da planilha, tenta localizar o nome exato
 * de cada coluna canônica.
 *
 * @param headers - Array de nomes de colunas da planilha
 * @returns Mapeamento: canonical -> nome real | null se não encontrado
 */
function mapColumns(headers) {
    const result = {};
    // Pré-normaliza todos os cabeçalhos da planilha uma única vez
    const normalizedHeaders = headers.map((h) => ({
        original: h,
        normalized: normalizeHeader(h),
    }));
    for (const [canonical, variants] of Object.entries(COLUMN_VARIANTS)) {
        // Normaliza as variantes conhecidas também (sem parênteses, sem acentos)
        const normalizedVariants = variants.map(normalizeHeader);
        const match = normalizedHeaders.find((h) => normalizedVariants.includes(h.normalized));
        result[canonical] = match ? match.original : null;
    }
    return result;
}
/**
 * Verifica se todas as colunas obrigatórias foram encontradas.
 * Retorna uma lista de nomes canônicos que estão faltando.
 */
function getMissingColumns(columnMap) {
    const requiredCanonicals = {
        salario: "Salário (ou Salário Base)",
        gratificacao: "Gratificação (ou Gratificações)",
        anuenio: "Anuênio",
    };
    return Object.entries(requiredCanonicals)
        .filter(([key]) => !columnMap[key])
        .map(([, label]) => label);
}
