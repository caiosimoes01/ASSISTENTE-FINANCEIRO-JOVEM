# 🚀 GUIA RÁPIDO - YoungFinance Components

## ⚡ Quick Start (2 minutos)

### 1. Ver tudo funcionando
```bash
npm run dev
```

### 2. Testar o Navigator
```tsx
// Em App.tsx ou arquivo temp
import { Navigator } from '@/components/young-finance';

export default Navigator;
```

Clique nas abas para navegar!

---

## 🧩 Componentes Disponíveis

### BentoCard
```tsx
import { BentoCard } from '@/components/young-finance';
import { TrendingUp } from 'lucide-react';

<BentoCard
  label="Rendimento"
  value="R$ 5.432,50"
  hint="Juros acumulados"
  icon={<TrendingUp size={20} />}
  highlight={true}  // Fundo verde neon
/>
```

### SliderField
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

### GrowthChart
```tsx
import { GrowthChart } from '@/components/young-finance';

const data = [
  { mes: 0, valor: 10000 },
  { mes: 12, valor: 12850 },
  { mes: 24, valor: 15890 },
];

<GrowthChart
  data={data}
  dataKeyX="mes"
  dataKeyY="valor"
  title="Projeção de Crescimento"
  height={350}
/>
```

### Navigator
```tsx
import { Navigator } from '@/components/young-finance';

<Navigator />
```

Componente completo com:
- Header sticky com glassmorphism
- Logo YoungFinance
- 4 abas funcionais (Assistente, Cenários, Investimentos, HP 12C)
- Renderização condicional

---

## 🎨 Classes Utilitárias

```css
/* Fundos */
.bg-youfing-primary      /* Azul escuro profundo */
.bg-youfing-secondary    /* Azul levemente claro */
.bg-youfing-tertiary     /* Azul para camadas extras */

/* Textos */
.text-youfing-primary    /* Branco */
.text-youfing-secondary  /* Cinza-azulado */
.text-youfing-tertiary   /* Cinza escuro */
.text-accent             /* Verde neon */

/* Sombras */
.shadow-youfing-sm       /* Sombra suave */
.shadow-youfing-md       /* Sombra média */
.shadow-youfing-lg       /* Sombra grande */
.shadow-youfing-glow     /* Sombra neon suave */
.shadow-youfing-glow-intense  /* Sombra neon intensa */

/* Gradientes */
.bg-gradient-youfing     /* Gradiente fundo principal */
.bg-gradient-accent      /* Gradiente neon */
.bg-gradient-card        /* Gradiente para cards */

/* Bordas */
.border-youfing          /* Borda sutil */
.border-youfing-light    /* Borda visível */
.border-accent           /* Borda neon */
```

---

## 📂 Estrutura de Pastas

```
src/components/young-finance/
├── BentoCard.tsx              ← Card versátil
├── SliderField.tsx            ← Input + Slider
├── GrowthChart.tsx            ← Gráfico
├── Navigator.tsx              ← Menu com abas
├── AssistantTab.tsx           ← Aba 1
├── ScenariosTab.tsx           ← Aba 2
├── InvestimentosTab.tsx       ← Aba 3
├── Hp12cTab.tsx               ← Aba 4
├── utils.ts                   ← Função cn()
├── index.ts                   ← Exports
├── README.md                  ← Docs
├── NAVIGATION.md              ← Docs
├── OVERVIEW.md                ← Docs
├── SHOWCASE.tsx               ← Demo
└── NAVIGATOR_DEMO.tsx         ← Demo
```

---

## 💾 Importação (Recomendado)

```tsx
// Usar barrel export - RECOMENDADO
import { BentoCard, SliderField, GrowthChart, Navigator } 
  from '@/components/young-finance';

// Ou importar específico
import { BentoCard } from '@/components/young-finance/BentoCard';
```

---

## 🎯 Casos de Uso

### Layout com Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <BentoCard label="Capital" value="R$ 10.000" hint="Inicial" />
  <BentoCard label="Aporte" value="R$ 500" hint="Mensal" />
  <BentoCard label="Período" value="120 meses" hint="10 anos" />
  <BentoCard 
    label="Valor Futuro" 
    value="R$ 50.000" 
    hint="Projeção"
    highlight={true}
  />
</div>
```

### Form com Sliders
```tsx
<div className="space-y-6">
  <SliderField
    label="Capital Inicial"
    value={capital}
    min={1000}
    max={100000}
    step={1000}
    onChange={setCapital}
    prefix="R$"
  />
  
  <SliderField
    label="Aporte Mensal"
    value={aporte}
    min={100}
    max={5000}
    step={100}
    onChange={setAporte}
    prefix="R$"
  />
</div>
```

### Dashboard com Gráfico
```tsx
<div className="space-y-8">
  <div className="grid grid-cols-3 gap-4">
    <BentoCard ... />
    <BentoCard ... />
    <BentoCard highlight={true} ... />
  </div>
  
  <GrowthChart data={projectionData} height={400} />
</div>
```

---

## 📚 Leia a Documentação

Para informações detalhadas:

- **README.md** - Componentes base
- **NAVIGATION.md** - Sistema de navegação
- **OVERVIEW.md** - Visão geral
- **SHOWCASE.tsx** - Exemplo completo
- **NAVIGATOR_DEMO.tsx** - Demo do Navigator

---

## ✨ Paleta de Cores

| Uso | Cor | Código |
|-----|-----|--------|
| Fundo principal | Azul escuro/preto | #0a0f1a |
| Fundo secundário | Azul claro | #0f1629 |
| Texto principal | Branco | #ffffff |
| Texto secundário | Cinza-azulado | #b0b8d4 |
| Destaque | Verde neon | #00d084 |
| Destaque claro | Verde neon claro | #1ae89f |

---

## 🚨 Próximas Tarefas

- [ ] Testar com `npm run dev`
- [ ] Integrar componentes em AssistantTab
- [ ] Criar BentoGrid (container responsivo)
- [ ] Conectar com lógica financeira
- [ ] Adicionar React Router
- [ ] Deploy em produção

---

**Criado:** 2026-05-27  
**Versão:** 1.0.0 (Beta)  
**Status:** ✅ Pronto para uso
