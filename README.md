# 📊 Sistema de Reajuste de Planilha Salarial

> Aplicação web full-stack para processamento automatizado de reajustes salariais e cálculos trabalhistas.

---

## ✨ Funcionalidades

- **Upload** de planilhas `.xls`, `.xlsx` e `.txt` com drag-and-drop
- **Reajuste salarial** calculado com INPC + Ganho Real
- **Cálculos automáticos**: férias, terço constitucional, 13º, FGTS, INSS, PIS, FAP/RAT
- **Download** da planilha processada em `.xlsx` com todas as colunas originais + calculadas
- **Validação completa** de formulários e tratamento de erros com mensagens descritivas
- Interface **premium** com dark mode e glassmorphism

---

## 🏗 Estrutura do Projeto

```
atualizacao-salarial/
├── frontend/                   # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload/     # Drag-and-drop de arquivos
│   │   │   ├── ParameterForm/  # Formulário de percentuais
│   │   │   ├── LoadingSpinner/ # Animação de carregamento
│   │   │   └── ResultPanel/    # Painel de sucesso/erro
│   │   ├── hooks/
│   │   │   └── useParameterForm.ts   # Validação do formulário
│   │   ├── services/
│   │   │   └── apiService.ts   # Comunicação com o backend
│   │   ├── types/
│   │   │   └── index.ts        # Tipos TypeScript
│   │   ├── App.tsx             # Componente raiz / orquestração
│   │   ├── index.css           # Design system (dark theme)
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                    # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/
│   │   │   └── processRoute.ts         # POST /api/process
│   │   ├── services/
│   │   │   ├── SpreadsheetReaderService.ts  # Leitura da planilha
│   │   │   ├── CalculatorService.ts         # Cálculos trabalhistas (puro)
│   │   │   └── SpreadsheetWriterService.ts  # Geração do Excel
│   │   ├── utils/
│   │   │   ├── columnMapper.ts     # Mapeamento tolerante de colunas
│   │   │   └── numberUtils.ts      # Utilitários numéricos
│   │   ├── types/
│   │   │   └── index.ts            # Tipos TypeScript
│   │   └── app.ts                  # Entry point Express
│   ├── tsconfig.json
│   └── package.json
│
├── SPEC.md                     # Especificação do sistema
└── README.md
```

---

## 🚀 Como executar

### Pré-requisitos

- Node.js 18+ instalado
- npm 9+

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

O backend estará disponível em: **http://localhost:3001**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

> O frontend faz proxy automático das requisições `/api` para o backend via Vite.

---

## 🏭 Build para produção

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

---

## 📋 Regras de negócio

### Reajuste Salarial

```
Percentual Total = INPC + Ganho Real
Novo Valor = Valor Atual × (1 + Percentual Total / 100)
```

Aplicado em: Salário, Gratificação e Anuênio.

### Férias e Décimo Terceiro

```
Base = Salário Reajustado + Gratificação Reajustada + Anuênio Reajustado
Férias = Base / 12
Terço Constitucional = Férias / 3
Décimo Terceiro = Base / 12
```

### Encargos

```
Base Encargos = Salário R. + Gratificação R. + Anuênio R. + Férias + Terço + 13º
FGTS          = Base Encargos × (FGTS% / 100)
INSS Patronal = Base Encargos × (INSS% / 100)
FAP/RAT       = Base Encargos × (FAP% / 100)
PIS           = Base Encargos × (PIS% / 100)
Total Encargos = FGTS + INSS + FAP/RAT + PIS
Total Geral    = Base Encargos + Total Encargos
```

> **Precisão**: Os arredondamentos para 2 casas decimais são aplicados apenas na planilha de saída. Os cálculos intermediários mantêm precisão total de ponto flutuante.

---

## 📊 Colunas geradas na planilha de saída

| Coluna | Descrição |
|--------|-----------|
| Salário Reajustado | Salário com reajuste aplicado |
| Gratificação Reajustada | Gratificação com reajuste |
| Anuênio Reajustado | Anuênio com reajuste |
| Base Férias | Soma dos três valores reajustados |
| Férias (1/12) | 1/12 da base |
| Terço Constitucional | 1/3 das férias |
| Décimo Terceiro (1/12) | 1/12 da base |
| Base Encargos | Soma de todos os itens acima |
| FGTS | Base Encargos × FGTS% |
| INSS Patronal | Base Encargos × INSS% |
| FAP/RAT | Base Encargos × FAP/RAT% |
| PIS | Base Encargos × PIS% |
| Total Encargos | Soma dos encargos |
| Total Geral | Base Encargos + Total Encargos |

---

## 🛠 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18, Vite, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Planilhas | xlsx (SheetJS) |
| Upload | multer |
| HTTP Client | axios |

---

## 🏛 Princípios de arquitetura

- **Separação de responsabilidades**: cada serviço tem uma única responsabilidade (leitura, cálculo, escrita)
- **Funções puras**: o `CalculatorService` não tem efeitos colaterais, facilitando testes
- **Tolerância a variações**: o `columnMapper` normaliza nomes de colunas (case-insensitive, sem acentos)
- **Validação em duas camadas**: cliente (React) e servidor (Express)
- **Precisão numérica**: arredondamento apenas na saída final

---

## ⚙️ Variáveis de ambiente

### Backend

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3001` | Porta do servidor |
| `FRONTEND_URL` | `http://localhost:5173` | URL do frontend (CORS) |

---

## 📄 Licença

Uso privado — processamento interno de cálculos trabalhistas.
