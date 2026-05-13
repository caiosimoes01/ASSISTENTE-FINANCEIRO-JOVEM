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

## 🛠️ Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure o ambiente:
   - Copie `.env.example` para `.env`
   - Preencha com suas credenciais do Firebase e Brapi.

3. Inicie o desenvolvimento:
   ```bash
   npm run dev
   ```

4. Rode os testes:
   ```bash
   npm run test
   ```

## 📐 Regras de Ouro

1. **Nunca** use matemática nativa de JS (`+`, `-`, `*`) para dinheiro. Use `Decimal`.
2. **Nunca** coloque lógica de cálculo dentro de componentes. Use o `/core`.
3. Todo código no `/core` deve ter testes unitários.
