import React, { useCallback, useRef, useState } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = [".xls", ".xlsx", ".txt"];
const ACCEPTED_MIME = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

/**
 * Componente de upload de arquivo com drag-and-drop.
 * Valida extensão do arquivo no cliente antes do envio.
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setClientError(
          `Formato "${ext}" não suportado. Use: ${ACCEPTED_EXTENSIONS.join(", ")}`
        );
        return;
      }
      setClientError(null);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const openFilePicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const dropzoneClass = [
    "file-upload__dropzone",
    isDragging ? "file-upload__dropzone--dragging" : "",
    selectedFile && !clientError ? "file-upload__dropzone--selected" : "",
    clientError ? "file-upload__dropzone--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="file-upload">
      <div
        className={dropzoneClass}
        onClick={openFilePicker}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Clique ou arraste uma planilha aqui"
        onKeyDown={(e) => e.key === "Enter" && openFilePicker()}
      >
        <input
          ref={inputRef}
          type="file"
          id="file-upload-input"
          className="file-upload__input"
          accept={[...ACCEPTED_EXTENSIONS, ...ACCEPTED_MIME].join(",")}
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden="true"
        />

        {selectedFile && !clientError ? (
          <>
            <div className="file-upload__icon" style={{ background: "rgba(72,187,120,0.15)", border: "1px solid rgba(72,187,120,0.4)" }}>
              📊
            </div>
            <div className="file-upload__filename">
              <span>✓</span>
              <span>{selectedFile.name}</span>
            </div>
            <div className="file-upload__text">
              <p className="file-upload__text-secondary">
                Arquivo pronto para processamento
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="file-upload__icon">
              {isDragging ? "📂" : "📁"}
            </div>
            <div className="file-upload__text">
              <p className="file-upload__text-primary">
                <span className="file-upload__text-accent">Clique para selecionar</span>
                {" "}ou arraste aqui
              </p>
              <p className="file-upload__text-secondary">
                Formatos aceitos: .xls, .xlsx, .txt (máx. 10MB)
              </p>
            </div>
          </>
        )}
      </div>

      {clientError && (
        <p className="form-field__error animate-slide-down">
          ⚠ {clientError}
        </p>
      )}

      {selectedFile && !clientError && (
        <button
          type="button"
          className="file-upload__change-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (inputRef.current) inputRef.current.value = "";
            openFilePicker();
          }}
        >
          Trocar arquivo
        </button>
      )}
    </div>
  );
};
