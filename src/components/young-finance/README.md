# 🧩 Componentes YoungFinance - Peças de Lego

Biblioteca de componentes isolados, reutilizáveis e estilizados com a **Paleta Premium Dark Mode** da YoungFinance.

## 📦 Componentes Disponíveis

### 1. **BentoCard** ✨
Card versátil para exibir informações em layout Bento Grid.

#### Props
```typescript
interface BentoCardProps {
  label: string;           // Título do card
  value: string;           // Valor principal
  hint: string;            // Descrição/dica
  icon?: React.ReactNode;  // Ícone opcional (lucide-react)
  highlight?: boolean;     // Inverter cores (fundo neon)
  className?: string;      // Classes Tailwind adicionais
}
```

#### Exemplo
```tsx
import { BentoCard } from '@/components/young-finance';
import { TrendingUp } from 'lucide-react';

<BentoCard
  label="Rendimento Total"
  value="R$ 5.432,50"
  hint="Juros acumulados"
  icon={<TrendingUp size={20} />}
  highlight={true}
/>
```

**Características:**
- ✅ Responsivo (adapta a qualquer tamanho)
- ✅ Efeito hover com sombra neon
- ✅ Estados normais e destacados
- ✅ Suporte a ícones lucide-react

---

### 2. **SliderField** 🎚️
Input numérico + Slider sincronizados para entrada de valores financeiros.

#### Props
```typescript
interface SliderFieldProps {
  label: string;           // Rótulo do campo
  value: number;           // Valor atual
  min: number;             // Valor mínimo
  max: number;             // Valor máximo
  step: number;            // Incremento (ex: 100 para valores)
  onChange: (value: number) => void;  // Callback de mudança
  prefix?: string;         // Prefixo (ex: "R$")
}
```

#### Exemplo
```tsx
import { SliderField } from '@/components/young-finance';
import { useState } from 'react';

const [capital, setCapital] = useState(10000);

<SliderField
  label="Capital Inicial"
  value={capital}
  min={1000}
  max={100000}
  step={1000}
  onChange={setCapital}
  prefix="R$"
/>
```

**Características:**
- ✅ Input text + slider sincronizados
- ✅ Validação em tempo real
- ✅ Gradiente verde neon na track
- ✅ Thumb com efeito glow
- ✅ Suporte a Firefox e Chrome
- ✅ Exibe range (min-max)

---

### 3. **GrowthChart** 📈
Gráfico de área com Recharts mostrando projeção de crescimento financeiro.

#### Props
```typescript
interface GrowthChartProps {
  data: GrowthChartDataPoint[];  // Array com dados
  dataKeyY?: string;              // Chave do valor Y (default: 'valor')
  dataKeyX?: string;              // Chave do valor X (default: 'mes')
  title?: string;                 // Título opcional
  height?: number;                // Altura em px (default: 300)
  className?: string;             // Classes Tailwind adicionais
}
```

#### Exemplo
```tsx
import { GrowthChart } from '@/components/young-finance';

const data = [
  { mes: 0, valor: 10000 },
  { mes: 12, valor: 12850 },
  { mes: 24, valor: 15890 },
  // ...
];

<GrowthChart
  data={data}
  dataKeyX="mes"
  dataKeyY="valor"
  title="Projeção de Crescimento"
  height={350}
/>
```

**Características:**
- ✅ Gradiente neon (#00d084)
- ✅ Tooltip customizado com formatação R$
- ✅ Grid e eixos estilizados dark mode
- ✅ Animação suave de renderização
- ✅ Responsivo (ResponsiveContainer)
- ✅ Suporta dados dinâmicos

---

## 🎨 Sistema de Cores

Os componentes usam **variáveis CSS** da paleta injetada em `src/index.css`:

```css
/* Fundos */
--color-bg-primary: #0a0f1a      /* Azul escuro profundo */
--color-bg-secondary: #0f1629    /* Azul levemente claro */

/* Textos */
--color-text-primary: #ffffff    /* Branco */
--color-text-secondary: #b0b8d4  /* Cinza-azulado */
--color-text-tertiary: #7a8299   /* Cinza escuro */

/* Destaques */
--color-accent-primary: #00d084  /* Verde neon vibrante */
--color-accent-dark: #00a863     /* Verde neon escuro */

/* Sombras */
--shadow-youfing-glow: 0 0 16px rgba(0, 208, 132, 0.2)
--shadow-youfing-glow-intense: 0 0 24px rgba(0, 208, 132, 0.35)
```

**Classes Tailwind personalizadas:**
- `.bg-youfing-primary` → Fundo principal
- `.text-accent` → Texto neon verde
- `.shadow-youfing-glow` → Sombra neon suave
- `.bg-gradient-accent` → Gradiente neon

---

## 🔧 Utilidades

### `cn()` - Class Merge Helper
Mescla classes CSS condicionalmente (similar a `classnames`).

```typescript
import { cn } from '@/components/young-finance';

const buttonClass = cn(
  'px-4 py-2 rounded',
  active ? 'bg-accent text-white' : 'bg-gray-200',
  disabled && 'opacity-50'
);
```

---

## 📚 Importações

### Opção 1: Import direto
```tsx
import { BentoCard } from '@/components/young-finance/BentoCard';
import { SliderField } from '@/components/young-finance/SliderField';
import { GrowthChart } from '@/components/young-finance/GrowthChart';
```

### Opção 2: Barrel import (recomendado)
```tsx
import { BentoCard, SliderField, GrowthChart } from '@/components/young-finance';
```

---

## 🎭 Showcase & Exemplos

Veja o arquivo **`SHOWCASE.tsx`** para um exemplo completo de como usar todos os componentes juntos.

Para visualizar o showcase:
```tsx
import { YoungFinanceShowcase } from '@/components/young-finance/SHOWCASE';

export default YoungFinanceShowcase;
```

---

## 🛡️ Filosofia de Componentes

✅ **Puro UI** - Nenhuma lógica de negócio
✅ **Isolado** - Sem dependências de estado global
✅ **Reutilizável** - Props bem definidas
✅ **Testável** - Componentes funcionais
✅ **Acessível** - Suporta keyboard + screen readers
✅ **Responsivo** - Mobile-first design

---

## 📝 TypeScript

Todos os componentes são **100% typados** com interfaces completas.

```typescript
// Intellisense automático em qualquer IDE
<BentoCard
  label="..."     // ✅ string
  value="..."     // ✅ string
  hint="..."      // ✅ string
  highlight={false} // ✅ boolean | undefined
/>
```

---

## 🚀 Próximos Passos

- [ ] Criar BentoGrid (container responsivo)
- [ ] Adicionar variantes de cards (outline, ghost, etc)
- [ ] Criar componentes de tabelas financeiras
- [ ] Adicionar animações de transição
- [ ] Testes unitários com Vitest

---

**Criado em:** 2026-05-27  
**Padrão:** YoungFinance Premium Dark Mode  
**Versão:** 1.0.0 (Beta)
