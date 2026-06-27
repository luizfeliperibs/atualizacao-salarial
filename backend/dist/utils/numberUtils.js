"use strict";
/**
 * Utilitários numéricos para cálculos monetários.
 *
 * IMPORTANTE: Arredondamento deve ser feito apenas na saída final.
 * Durante os cálculos internos, manter precisão total do float.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.round2 = round2;
exports.percentToDecimal = percentToDecimal;
exports.toNumber = toNumber;
/**
 * Arredonda um número para duas casas decimais (usado apenas na saída final).
 */
function round2(value) {
    return Math.round(value * 100) / 100;
}
/**
 * Converte um percentual informado pelo usuário (ex: 8.5) para fator decimal (ex: 0.085).
 */
function percentToDecimal(percent) {
    return percent / 100;
}
/**
 * Converte um valor desconhecido de célula da planilha para número.
 * Retorna 0 se o valor for nulo, undefined ou não numérico.
 */
function toNumber(value) {
    if (value === null || value === undefined || value === "")
        return 0;
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
}
