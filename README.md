# SOC - Assistente Financeiro (MVP)

Assistente financeiro moderno voltado para jovens brasileiros, com foco em educação e precisão matemática.

## 🚀 Tecnologias

- **React + TypeScript + Vite**
- **TailwindCSS** (Estilização premium)
- **Decimal.js** (Precisão monetária absoluta)
- **Vitest** (TDD e qualidade)
- **Firebase** (Auth e Firestore)

## 📂 Arquitetura

O projeto segue uma separação rigorosa de responsabilidades:
- `/core/finance`: Lógica matemática pura, desacoplada do React.
- `/services`: Integrações externas (Bacen, Firebase, Brapi).
- `/types`: Contratos de dados centralizados.
- `/components`: UI modular.
