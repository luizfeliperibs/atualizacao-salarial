import React from "react";
import { downloadBlob } from "../../services/apiService";

interface ResultPanelProps {
  state: "success" | "error";
  outputBlob: Blob | null;
  outputFilename: string;
  errorMessage: string;
  onReset: () => void;
}

/**
 * Painel de resultado exibido após o processamento.
 * Mostra sucesso com botão de download, ou erro com mensagem descritiva.
 */
export const ResultPanel: React.FC<ResultPanelProps> = ({
  state,
  outputBlob,
  outputFilename,
  errorMessage,
  onReset,
}) => {
  const handleDownload = () => {
    if (outputBlob) {
      downloadBlob(outputBlob, outputFilename);
    }
  };

  if (state === "success") {
    return (
      <div className="result-panel animate-fade-in">
        <div className="result-panel__icon result-panel__icon--success" aria-hidden="true">
          ✅
        </div>

        <div>
          <h2 className="result-panel__title">Planilha processada!</h2>
          <p className="result-panel__message">
            Todos os cálculos trabalhistas foram realizados com sucesso.
            Clique abaixo para baixar a planilha reajustada.
          </p>
        </div>

        <div className="result-panel__actions">
          <button
            id="btn-download"
            type="button"
            className="btn btn--success"
            onClick={handleDownload}
            aria-label={`Baixar planilha: ${outputFilename}`}
          >
            ⬇ Baixar Planilha
          </button>

          <button
            id="btn-process-another"
            type="button"
            className="btn btn--ghost"
            onClick={onReset}
          >
            Processar outra planilha
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-panel animate-fade-in">
      <div className="result-panel__icon result-panel__icon--error" aria-hidden="true">
        ❌
      </div>

      <div>
        <h2 className="result-panel__title">Erro no processamento</h2>
        <p className="result-panel__message">
          Não foi possível processar a planilha. Verifique o erro abaixo e tente novamente.
        </p>
      </div>

      {errorMessage && (
        <div className="result-panel__error-detail" role="alert">
          ⚠ {errorMessage}
        </div>
      )}

      <div className="result-panel__actions">
        <button
          id="btn-try-again"
          type="button"
          className="btn btn--primary"
          onClick={onReset}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
};
