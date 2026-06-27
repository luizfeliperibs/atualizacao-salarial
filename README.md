# Sistema de Reajuste de Planilha Salarial

## Objetivo

Desenvolver uma aplicação web onde o usuário possa enviar uma planilha (.xls, .xlsx ou .txt), informar alguns índices e percentuais, e receber uma nova planilha com todos os cálculos trabalhistas realizados automaticamente.

A aplicação deve ser simples, intuitiva e totalmente automatizada.

---

# Fluxo da Aplicação

1. O usuário acessa o site.
2. Faz upload de uma planilha.
3. O sistema lê todos os registros.
4. O usuário informa os seguintes campos:

- Índice INPC (%)
- Ganho Real (%)
- FGTS (%)
- INSS Patronal (%)
- PIS (%)
- FAP/RAT (%) (campo único)

5. O sistema realiza todos os cálculos.
6. O sistema gera uma nova planilha.
7. O usuário faz o download da planilha atualizada.

---

# Formatos aceitos

Entrada:

- .xls
- .xlsx
- .txt (caso esteja estruturado em colunas)

Saída:

- Preferencialmente .xlsx

---

# Estrutura da planilha

A planilha possui, entre outras, as seguintes colunas importantes:

- Salário
- Gratificação
- Anuênio

Essas colunas serão utilizadas nos cálculos.

Os nomes das colunas podem variar, então criar um mapeamento simples ou permitir configuração futura.

---

# Reajuste Salarial

Primeiro deve ser calculado o percentual de reajuste.

Percentual Total =

INPC + Ganho Real

Exemplo:

INPC = 5%

Ganho Real = 2%

Reajuste = 7%

Esse reajuste deve ser aplicado em:

- Salário
- Gratificação
- Anuênio

Fórmula:

Novo Valor = Valor Atual × (1 + Reajuste)

---

# Cálculo das Férias

Após atualizar os valores:

Base das férias =

Salário +
Gratificação +
Anuênio

Calcular:

Férias = Base / 12

---

# Terço Constitucional

Sobre o valor das férias aplicar:

1/3

Ou seja:

Terço = Férias / 3

---

# Décimo Terceiro

Calcular:

13º = Base / 12

Onde Base =

Salário +
Gratificação +
Anuênio

---

# Base para Encargos

A base para incidência dos encargos será:

Base Encargos =

Salário +
Gratificação +
Anuênio +
Férias +
Terço Constitucional +
Décimo Terceiro

---

# Encargos

Sobre a Base Encargos calcular:

## FGTS

FGTS =

Base Encargos × percentual informado

---

## INSS Patronal

INSS =

Base Encargos × percentual informado

---

## FAP/RAT

FAP/RAT =

Base Encargos × percentual informado

---

## PIS

PIS =

Base Encargos × percentual informado

---

# Total de Encargos

Total Encargos =

FGTS +
INSS +
FAP/RAT +
PIS

---

# Total Geral

Total Geral =

Base Encargos +
Total Encargos

---

# Planilha de saída

A planilha final deve manter todas as colunas originais.

Além disso adicionar novas colunas:

- Salário Reajustado
- Gratificação Reajustada
- Anuênio Reajustado
- Base Férias
- Férias (1/12)
- Terço Constitucional
- Décimo Terceiro (1/12)
- Base Encargos
- FGTS
- INSS Patronal
- FAP/RAT
- PIS
- Total Encargos
- Total Geral

---

# Interface

A interface deve possuir:

## Upload

Botão:

Selecionar Planilha

---

## Campos

Input para:

- INPC (%)
- Ganho Real (%)
- FGTS (%)
- INSS Patronal (%)
- PIS (%)
- FAP/RAT (%)

Todos devem aceitar números decimais.

Exemplo:

8.5

---

## Botão

Processar Planilha

---

## Resultado

Após o processamento:

Mostrar mensagem:

"Planilha processada com sucesso."

Exibir botão:

Baixar Planilha

---

# Tratamento de erros

Caso o arquivo seja inválido:

Mostrar mensagem amigável.

Caso falte alguma coluna obrigatória:

Informar exatamente qual coluna está faltando.

Caso algum campo esteja vazio:

Impedir o processamento.

---

# Requisitos Técnicos

A aplicação deve ser organizada em camadas:

- Interface
- Serviço de processamento
- Serviço de leitura da planilha
- Serviço de geração da planilha
- Utilitários

Evitar lógica dentro da interface.

Criar funções pequenas e reutilizáveis.

Utilizar boas práticas de programação.

Seguir princípios SOLID quando possível.

---

# Tecnologias sugeridas

Frontend:

- React
- Vite
- TypeScript

Backend:

- Node.js
- Express

Bibliotecas:

- xlsx (leitura e escrita de Excel)

---

# Observações importantes

Todos os percentuais informados pelo usuário devem ser convertidos corretamente.

Exemplo:

8

=

8%

=

0,08

Nunca assumir que o usuário digitará 0,08.

---

Todos os cálculos devem ser feitos utilizando os valores reajustados.

Os valores monetários devem ser arredondados para duas casas decimais apenas na apresentação final, mantendo precisão durante os cálculos internos.

O código deve ser limpo, bem documentado e fácil de manter.
