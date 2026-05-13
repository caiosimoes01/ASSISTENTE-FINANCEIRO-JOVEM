``markdown
# 🏗️ BLUEPRINT DO PROJETO: Calculadora Financeira Brasileira

## 👁️ VISÃO MACRO

Uma calculadora financeira clara, confiável e educativa para jovens brasileiros,
que simula juros compostos, rendimentos, aportes mensais, inflação real e
equivalência de taxas — com precisão monetária de nível profissional.

> Objetivo: ser a calculadora financeira mais honesta e simples para quem está
> aprendendo a investir no Brasil.

---

## 📚 DICIONÁRIO DE DADOS (Entidades)

### 💰 Investimento
Representa uma aplicação financeira simulada pelo usuário.

| Campo            | Tipo     | Descrição                              |
|------------------|----------|----------------------------------------|
| id               | string   | Identificador único                    |
| nome             | string   | Nome da aplicação (ex: "Tesouro IPCA") |
| capitalInicial   | Decimal  | Valor inicial aportado (em R$)         |
| aporteMensal     | Decimal  | Valor aportado por mês (pode ser zero) |
| periodoMeses     | number   | Duração da simulação em meses          |
| taxaId           | string   | Referência à entidade Taxa             |
| criadoEm        | Date     | Data de criação da simulação           |

### 📈 Rendimento
Resultado calculado de uma simulação. Nunca calculado dentro de componentes.

| Campo              | Tipo    | Descrição                                 |
|--------------------|---------|-------------------------------------------|
| investimentoId     | string  | Referência ao Investimento simulado       |
| valorFuturo        | Decimal | Montante final projetado                  |
| totalInvestido     | Decimal | Capital inicial + soma dos aportes        |
| totalJuros         | Decimal | Diferença entre valorFuturo e totalInvestido |
| taxaRealAnual      | Decimal | Taxa descontada da inflação               |
| historicoMensal    | array   | Lista mês a mês de { mes, saldo, juros }  |

### 📊 Taxa
Representa uma taxa de referência financeira.

| Campo       | Tipo    | Descrição                                      |
|-------------|---------|------------------------------------------------|
| id          | string  | Identificador único                            |
| nome        | string  | Nome da taxa (ex: "CDI", "SELIC", "IPCA")      |
| valorAnual  | Decimal | Valor percentual ao ano                        |
| valorMensal | Decimal | Equivalente mensal (calculado, nunca manual)   |
| fonte       | string  | Origem do dado (ex: "Banco Central", "manual") |
| atualizadoEm| Date    | Última atualização do valor                    |

---

## 🛑 REGRAS DE OURO

### 1. Precisão monetária obrigatória
**NUNCA** use operações nativas de JavaScript para cálculos financeiros.
`0.1 + 0.2` em JS retorna `0.30000000000000004`. Em sistema financeiro isso é
inaceitável. Use **sempre** `decimal.js`:

```ts
// ❌ Proibido
const resultado = 1000 * 0.12;

// ✅ Correto
import Decimal from 'decimal.js';
const resultado = new Decimal(1000).mul(0.12);
```

### 2. Cálculo nunca vive em componente React
Componentes React são **somente** responsáveis por exibir e coletar dados.
Toda matemática financeira fica em `src/core/finance/`. Um componente
**chama** uma função do core — nunca recalcula por conta própria.

```ts
// ❌ Proibido — cálculo dentro do componente
function Calculadora() {
  const resultado = principal * Math.pow(1 + taxa, meses); // NUNCA
}

// ✅ Correto — componente só chama o core
import { calculateFutureValue } from '../core/finance';
function Calculadora() {
  const resultado = calculateFutureValue(principal, taxa, meses);
}
```

### 3. TDD: teste antes do código de produção
Nenhuma função do core entra em produção sem teste. O ciclo é sempre:
1. Escrever o teste (o que a função DEVE retornar)
2. Ver o teste falhar (confirma que o teste está ativo)
3. Escrever a função até o teste passar
4. Refatorar com segurança

### 4. Funções puras no core
Funções de `src/core/finance/` não podem:
- Importar nada de React
- Fazer chamadas a APIs ou Firebase
- Ter efeitos colaterais
- Depender de estado externo

Elas recebem valores, devolvem valores. Só isso.

### 5. Simplicidade acima de tudo
Não implemente o que não está sendo usado agora.
Cada função faz exatamente uma coisa.
Nomes em inglês no código, comentários em português quando necessário.

---

## 🧰 STACK TECNOLÓGICA

| Camada              | Tecnologia          | Por quê                                          |
|---------------------|---------------------|--------------------------------------------------|
| Framework UI        | React 18            | Padrão de mercado, ampla documentação            |
| Linguagem           | TypeScript          | Erros detectados antes de rodar, código mais claro |
| Build               | Vite                | Rápido, moderno, configuração mínima             |
| Testes              | Vitest              | Integrado ao Vite, API idêntica ao Jest          |
| Precisão monetária  | decimal.js          | Obrigatório para qualquer cálculo financeiro     |
| Estilo              | CSS Modules ou Tailwind | A definir na etapa de UI                    |
| Deploy              | Vercel ou Netlify   | Gratuito, integrado ao GitHub, zero config       |

### Versões (ao iniciar o projeto)
```json
{
  "react": "^18",
  "typescript": "^5",
  "vite": "^5",
  "vitest": "^1",
  "decimal.js": "^10"
}
```

---

## 📂 MAPA DE PASTAS

```
calculadora-financeira/
│
├── blueprint.md              ← ESTE ARQUIVO — leia antes de codar
├── README.md                 ← Como rodar o projeto
├── package.json
├── tsconfig.json
├── vite.config.ts
│
├── src/
│   │
│   ├── core/
│   │   └── finance/          ← Motor matemático — ZERO React aqui
│   │       ├── compoundInterest.ts   (juros compostos)
│   │       ├── equivalentRates.ts    (conversão entre taxas)
│   │       ├── futureValue.ts        (valor futuro com aportes)
│   │       ├── inflation.ts          (taxa real descontada inflação)
│   │       ├── presentValue.ts       (valor presente)
│   │       └── index.ts              (exporta tudo)
│   │
│   ├── components/           ← Elementos visuais reutilizáveis
│   │   ├── InputMoeda.tsx
│   │   ├── InputTaxa.tsx
│   │   ├── GraficoRendimento.tsx
│   │   └── CardResultado.tsx
│   │
│   ├── pages/                ← Telas completas
│   │   ├── Home.tsx
│   │   ├── SimuladorJuros.tsx
│   │   └── SimuladorAportes.tsx
│   │
│   ├── hooks/                ← Lógica React reutilizável
│   │   └── useSimulacao.ts
│   │
│   ├── types/                ← Tipos e interfaces TypeScript
│   │   └── financeiro.ts     (Investimento, Rendimento, Taxa)
│   │
│   └── utils/                ← Funções auxiliares (formatação, etc.)
│       └── formatadores.ts   (formatarMoeda, formatarPorcentagem)
│
└── tests/                    ← Testes — espelham a estrutura de src/
    └── core/
        └── finance/
            ├── compoundInterest.test.ts
            ├── equivalentRates.test.ts
            └── futureValue.test.ts
```

---

## 🚀 SCRIPTS DISPONÍVEIS

```bash
npm run dev      # Inicia servidor local (http://localhost:5173)
npm run test     # Roda todos os testes
npm run build    # Gera versão de produção
npm run preview  # Visualiza o build localmente
```

---

## 🔭 PRÓXIMAS ETAPAS (em ordem de prioridade)

- [ ] Criar funções do core com testes passando
- [ ] Criar tipos TypeScript das entidades
- [ ] Construir primeiro simulador (juros compostos simples)
- [ ] Adicionar formatação de moeda brasileira (R$)
- [ ] Conectar simulador a taxas reais (API do Banco Central)
- [ ] Adicionar cálculo de inflação (IPCA)
- [ ] Implementar tabela IR regressivo (renda fixa)
- [ ] Deploy no Vercel

---

## ⚠️ O QUE NUNCA FAZER

| Proibido                                | Por quê                                          |
|-----------------------------------------|--------------------------------------------------|
| `0.1 + 0.2` para dinheiro              | Resultado impreciso em JavaScript                |
| Cálculo financeiro dentro de componente | Quebra separação de responsabilidades            |
| Subir código sem teste no core          | Uma mudança silenciosa quebra tudo               |
| Pedir para IA gerar tudo de uma vez     | Gera código desorganizado sem arquitetura clara  |
| Misturar React com lógica de negócio    | Impossível de testar e manter depois             |

---

*Última atualização: início do projeto*
*Mantenha este arquivo atualizado conforme o projeto evolui.*
