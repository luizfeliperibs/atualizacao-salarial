````markdown
# Aplicação de Reajuste de Planilha Salarial

## 📖 Sobre o projeto

Esta aplicação foi desenvolvida para automatizar o processamento de planilhas contendo informações salariais, realizando reajustes e cálculos trabalhistas de forma rápida e padronizada.

O usuário realiza o upload de uma planilha, informa os índices necessários e recebe uma nova planilha contendo os valores reajustados e todos os encargos calculados automaticamente.

---

# 🚀 Funcionalidades

- Upload de planilhas `.xls`, `.xlsx` e `.txt`
- Reajuste de salários utilizando:
  - INPC
  - Ganho Real
- Cálculo automático de:
  - Salário reajustado
  - Gratificação reajustada
  - Anuênio reajustado
  - Férias (1/12)
  - Terço Constitucional
  - 13º salário (1/12)
  - Base de encargos
  - FGTS
  - INSS Patronal
  - FAP/RAT
  - PIS
  - Total de encargos
  - Total geral
- Download da planilha processada

---

# 🔄 Fluxo da aplicação

1. O usuário acessa a aplicação.
2. Realiza o upload da planilha.
3. Informa os percentuais:
   - INPC
   - Ganho Real
   - FGTS
   - INSS Patronal
   - PIS
   - FAP/RAT
4. O sistema processa os dados.
5. Uma nova planilha é gerada para download.

---

# 📁 Estrutura do projeto

```text
/
├── frontend/
├── backend/
├── SPEC.md
├── README.md
└── package.json
````

---

# 🛠 Tecnologias

## Frontend

* React
* Vite
* TypeScript

## Backend

* Node.js
* Express
* TypeScript

## Bibliotecas

* xlsx
* multer
* cors

---

# ⚙️ Como executar

## 1. Clone o repositório

```bash
git clone <url-do-repositorio>
```

## 2. Entre na pasta

```bash
cd nome-do-projeto
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
npm install
npm run dev
```

---

# 📋 Regras de negócio

* O reajuste salarial é calculado pela soma de:

  * INPC
  * Ganho Real

* O reajuste é aplicado em:

  * Salário
  * Gratificação
  * Anuênio

* A base para férias e décimo terceiro corresponde à soma de:

  * Salário reajustado
  * Gratificação reajustada
  * Anuênio reajustado

* Férias correspondem a **1/12** da base.

* O Terço Constitucional corresponde a **1/3** das férias.

* O Décimo Terceiro corresponde a **1/12** da base.

* A Base de Encargos é composta por:

  * Salário reajustado
  * Gratificação reajustada
  * Anuênio reajustado
  * Férias
  * Terço Constitucional
  * Décimo Terceiro

* Sobre a Base de Encargos são aplicados:

  * FGTS
  * INSS Patronal
  * FAP/RAT
  * PIS

---

# 📊 Estrutura da planilha de saída

A planilha gerada mantém todas as colunas originais e adiciona:

* Salário Reajustado
* Gratificação Reajustada
* Anuênio Reajustado
* Base Férias
* Férias (1/12)
* Terço Constitucional
* Décimo Terceiro (1/12)
* Base Encargos
* FGTS
* INSS Patronal
* FAP/RAT
* PIS
* Total Encargos
* Total Geral

---

# ✅ Validações

A aplicação impede o processamento quando:

* O arquivo enviado é inválido.
* O formato da planilha não é suportado.
* Alguma coluna obrigatória não está presente.
* Algum percentual obrigatório não foi informado.

Mensagens de erro claras devem ser apresentadas ao usuário.

---

# 🎯 Objetivos do projeto

* Automatizar cálculos trabalhistas.
* Reduzir erros em planilhas.
* Facilitar reajustes salariais.
* Gerar planilhas prontas para utilização.

---

# 📄 Licença

Este projeto é de uso privado e destinado ao processamento interno de cálculos trabalhistas, salvo disposição em contrário pelo proprietário do repositório.

```
```
