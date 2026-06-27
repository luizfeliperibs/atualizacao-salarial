"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorService = void 0;
const numberUtils_1 = require("../utils/numberUtils");
/**
 * Serviço de cálculo trabalhista.
 *
 * Todas as funções são puras (sem efeitos colaterais), facilitando testes
 * e futuras alterações nos cálculos.
 *
 * IMPORTANTE: O arredondamento para 2 casas decimais é feito apenas no
 * SpreadsheetWriterService (na saída final), não aqui.
 * Isso preserva a precisão dos cálculos intermediários.
 */
class CalculatorService {
    /**
     * Processa todas as linhas da planilha, aplicando os cálculos trabalhistas.
     */
    processRows(rows, columnMap, params) {
        return rows.map((row) => this.processRow(row, columnMap, params));
    }
    /**
     * Processa uma única linha, aplicando todos os cálculos.
     */
    processRow(row, columnMap, params) {
        // Lê os valores originais da planilha
        const salario = (0, numberUtils_1.toNumber)(row[columnMap.salario]);
        const gratificacao = (0, numberUtils_1.toNumber)(row[columnMap.gratificacao]);
        const anuenio = (0, numberUtils_1.toNumber)(row[columnMap.anuenio]);
        // === ETAPA 1: Reajuste salarial ===
        const { salarioReajustado, gratificacaoReajustada, anuenioReajustado } = this.calcularReajuste(salario, gratificacao, anuenio, params);
        // === ETAPA 2: Base para férias e 13º ===
        const baseFeriasE13 = this.calcularBase(salarioReajustado, gratificacaoReajustada, anuenioReajustado);
        // === ETAPA 3: Férias (1/12 da base) ===
        const ferias = this.calcularFerias(baseFeriasE13);
        // === ETAPA 4: Terço constitucional (1/3 das férias) ===
        const tercoConstitucional = this.calcularTercoConstitucional(ferias);
        // === ETAPA 5: Décimo Terceiro (1/12 da base) ===
        const decimoTerceiro = this.calcularDecimoTerceiro(baseFeriasE13);
        // === ETAPA 6: Base de encargos ===
        const baseEncargos = this.calcularBaseEncargos(salarioReajustado, gratificacaoReajustada, anuenioReajustado, ferias, tercoConstitucional, decimoTerceiro);
        // === ETAPA 7: Encargos ===
        const { fgts, inssPatronal, fapRat, pis } = this.calcularEncargos(baseEncargos, params);
        // === ETAPA 8: Totais ===
        const totalEncargos = fgts + inssPatronal + fapRat + pis;
        const totalGeral = baseEncargos + totalEncargos;
        // Retorna a linha original com as colunas calculadas adicionadas ao final
        return {
            ...row,
            "Salário Reajustado": salarioReajustado,
            "Gratificação Reajustada": gratificacaoReajustada,
            "Anuênio Reajustado": anuenioReajustado,
            "Base Férias": baseFeriasE13,
            "Férias (1/12)": ferias,
            "Terço Constitucional": tercoConstitucional,
            "Décimo Terceiro (1/12)": decimoTerceiro,
            "Base Encargos": baseEncargos,
            FGTS: fgts,
            "INSS Patronal": inssPatronal,
            "FAP/RAT": fapRat,
            PIS: pis,
            "Total Encargos": totalEncargos,
            "Total Geral": totalGeral,
        };
    }
    /**
     * Calcula o reajuste salarial.
     *
     * Fórmula: Novo Valor = Valor Atual × (1 + (INPC + Ganho Real) / 100)
     * O INPC e Ganho Real são somados ANTES da conversão para decimal.
     */
    calcularReajuste(salario, gratificacao, anuenio, params) {
        // Percentual total: soma simples dos percentuais (conforme SPEC.md)
        const percentualTotal = params.inpc + params.ganhoReal;
        const fatorReajuste = 1 + (0, numberUtils_1.percentToDecimal)(percentualTotal);
        return {
            salarioReajustado: salario * fatorReajuste,
            gratificacaoReajustada: gratificacao * fatorReajuste,
            anuenioReajustado: anuenio * fatorReajuste,
        };
    }
    /**
     * Calcula a base para férias e décimo terceiro.
     * Base = Salário Reajustado + Gratificação Reajustada + Anuênio Reajustado
     */
    calcularBase(salarioReajustado, gratificacaoReajustada, anuenioReajustado) {
        return salarioReajustado + gratificacaoReajustada + anuenioReajustado;
    }
    /**
     * Calcula as férias proporcionais (1/12 da base).
     */
    calcularFerias(base) {
        return base / 12;
    }
    /**
     * Calcula o terço constitucional (1/3 das férias).
     */
    calcularTercoConstitucional(ferias) {
        return ferias / 3;
    }
    /**
     * Calcula o décimo terceiro proporcional (1/12 da base).
     */
    calcularDecimoTerceiro(base) {
        return base / 12;
    }
    /**
     * Calcula a base de encargos.
     * Base Encargos = Sal.Reajustado + Gratif.Reajustada + Anuênio Reajustado
     *                 + Férias + Terço Constitucional + Décimo Terceiro
     */
    calcularBaseEncargos(salarioReajustado, gratificacaoReajustada, anuenioReajustado, ferias, tercoConstitucional, decimoTerceiro) {
        return (salarioReajustado +
            gratificacaoReajustada +
            anuenioReajustado +
            ferias +
            tercoConstitucional +
            decimoTerceiro);
    }
    /**
     * Calcula todos os encargos sobre a base de encargos.
     * Cada percentual é convertido de % para decimal antes do cálculo.
     */
    calcularEncargos(baseEncargos, params) {
        return {
            fgts: baseEncargos * (0, numberUtils_1.percentToDecimal)(params.fgts),
            inssPatronal: baseEncargos * (0, numberUtils_1.percentToDecimal)(params.inssPatronal),
            fapRat: baseEncargos * (0, numberUtils_1.percentToDecimal)(params.fapRat),
            pis: baseEncargos * (0, numberUtils_1.percentToDecimal)(params.pis),
        };
    }
}
exports.CalculatorService = CalculatorService;
