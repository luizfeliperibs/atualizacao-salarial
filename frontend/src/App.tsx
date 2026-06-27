import React, { useState, useCallback } from "react";
import { FileUpload } from "./components/FileUpload/FileUpload";
import { ParameterForm } from "./components/ParameterForm/ParameterForm";
import { LoadingSpinner } from "./components/LoadingSpinner/LoadingSpinner";
import { ResultPanel } from "./components/ResultPanel/ResultPanel";
import { useParameterForm } from "./hooks/useParameterForm";
import { processSpreadsheet } from "./services/apiService";
import { AppState } from "./types";

/**
 * Componente raiz da aplicação.
 * Orquestra o fluxo: upload → configuração → processamento → resultado.
 */
function App() {
  const [appState, setAppState] = useState<AppState>("input");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { params, errors, handleChange, validate, reset: resetForm } = useParameterForm();

  const isInputDisabled = appState === "processing";

  // Determina o progresso visual (1/3 steps)
  const getStepProgress = (): number => {
    if (!selectedFile) return 0;
    const paramsFilled = Object.values(params).filter(Boolean).length;
    if (paramsFilled === 6) return 100;
    return Math.round((paramsFilled / 6) * 66) + 33;
  };

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação: arquivo
    if (!selectedFile) {
      setErrorMessage("Selecione uma planilha antes de processar.");
      setAppState("error");
      return;
    }

    // Validação: parâmetros do formulário
    const isValid = validate();
    if (!isValid) return;

    setAppState("processing");
    setErrorMessage("");

    try {
      const blob = await processSpreadsheet(selectedFile, params);

      // Constrói o nome do arquivo de saída
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
      setOutputFilename(`${baseName}_reajustado.xlsx`);
      setOutputBlob(blob);
      setAppState("success");
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado. Tente novamente.";
      setErrorMessage(msg);
      setAppState("error");
    }
  };

  const handleReset = useCallback(() => {
    setAppState("input");
    setSelectedFile(null);
    setOutputBlob(null);
    setOutputFilename("");
    setErrorMessage("");
    resetForm();
  }, [resetForm]);

  const showForm = appState === "input" || appState === "processing";
  const progress = getStepProgress();

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header */}
        <header className="app-header animate-fade-in">
          <div className="app-header__badge">
            <span className="app-header__badge-dot" />
            Sistema Automatizado
          </div>
          <h1 className="app-header__title">Reajuste Salarial</h1>
          <p className="app-header__subtitle">
            Faça upload da planilha, informe os índices trabalhistas
            e baixe os cálculos prontos em segundos.
          </p>
        </header>

        {/* Estados: formulário, carregando, resultado */}
        {appState === "processing" ? (
          <div className="card card--glow animate-fade-in">
            <LoadingSpinner />
          </div>
        ) : appState === "success" || appState === "error" ? (
          <div className="card animate-fade-in">
            <ResultPanel
              state={appState}
              outputBlob={outputBlob}
              outputFilename={outputFilename}
              errorMessage={errorMessage}
              onReset={handleReset}
            />
          </div>
        ) : null}

        {/* Formulário (visível apenas no estado input) */}
        {showForm && appState !== "processing" && (
          <form onSubmit={handleSubmit} noValidate aria-label="Formulário de reajuste salarial">
            {/* Barra de progresso */}
            <div className="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Card: Upload */}
            <div className="card animate-fade-in" style={{ marginTop: "var(--spacing-md)" }}>
              <div className="section-label">
                <div className="section-label__icon">1</div>
                Upload da Planilha
              </div>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                disabled={isInputDisabled}
              />
            </div>

            {/* Card: Parâmetros */}
            <div className="card animate-fade-in" style={{ marginTop: "var(--spacing-xl)" }}>
              <div className="section-label">
                <div className="section-label__icon">2</div>
                Índices e Percentuais
              </div>
              <ParameterForm
                params={params}
                errors={errors}
                onChange={handleChange}
                disabled={isInputDisabled}
              />
            </div>

            {/* Botão de submit */}
            <div style={{ marginTop: "var(--spacing-xl)" }}>
              <button
                id="btn-processar"
                type="submit"
                className="btn btn--primary"
                disabled={isInputDisabled || !selectedFile}
                aria-label="Processar planilha"
              >
                ⚡ Processar Planilha
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <footer className="app-footer">
          <p>Sistema de Reajuste Salarial • Cálculos trabalhistas automatizados</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
