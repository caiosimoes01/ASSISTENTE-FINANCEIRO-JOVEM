# 🗂️ Navigator - Sistema de Navegação por Abas

Sistema de navegação premium com **glassmorphism**, gerenciamento de abas e interface sticky da YoungFinance.

## 📋 Componentes

### `Navigator.tsx` 
Componente principal que gerencia a navegação entre as 4 abas principais.

**Características:**
- ✅ Header sticky com `backdrop-blur` (glassmorphism)
- ✅ Logo YoungFinance à esquerda
- ✅ 4 abas com ícones lucide-react
- ✅ Efeito hover com destaque neon
- ✅ Renderização condicional de componentes
- ✅ Responsivo (ícones visíveis em mobile, labels em desktop+)
- ✅ Transições suaves 300ms

#### Estado
```typescript
const [activeTab, setActiveTab] = useState<string>('assistant');
```

#### Abas Disponíveis
| ID | Label | Ícone | Descrição |
|---|---|---|---|
| `assistant` | Assistente | Zap ⚡ | Assistente IA com Bento Grid |
| `scenarios` | Cenários | BarChart2 📊 | Comparação de cenários financeiros |
| `investimentos` | Investimentos | Target 🎯 | Alocação de investimentos |
| `hp12c` | HP 12C | Calculator 🧮 | Simulador financeiro profissional |

---

### `AssistantTab.tsx`
Mock da tela do Assistente IA com Bento Grid.

```tsx
<AssistantTab />
```

**Conteúdo:**
- [Mock] Tela do Assistente IA com Bento Grid
- Placeholder para integração futura

---

### `ScenariosTab.tsx`
Mock da tela de Comparação de Cenários.

```tsx
<ScenariosTab />
```

**Conteúdo:**
- [Mock] Tela de Comparação de Cenários
- Simule múltiplos cenários financeiros

---

### `InvestimentosTab.tsx`
Mock da tela de Alocação de Investimentos.

```tsx
<InvestimentosTab />
```

**Conteúdo:**
- [Mock] Tela de Alocação de Investimentos
- Gerencie sua carteira de investimentos

---

### `Hp12cTab.tsx`
Mock do Simulador Financeiro HP 12C.

```tsx
<Hp12cTab />
```

**Conteúdo:**
- [Mock] Simulador Financeiro HP 12C
- Cálculos avançados: TIR, VPL, fluxo de caixa

---

## 🎨 Design & Estilo

### Header
```
┌─────────────────────────────────────────────────────┐
│ [YF Logo] YoungFinance  │ Assistante 🟢 Cenários... │
└─────────────────────────────────────────────────────┘
 ↑ Sticky (z-50)         ↑ backdrop-blur-md
 └ Glassmorphism         └ Green neon glow on active
```

### Cores e Efeitos
- **Fundo:** `bg-youfing-primary/80` (com transparência)
- **Aba ativa:** `bg-accent text-youfing-primary` com `shadow-youfing-glow`
- **Aba inativa:** `text-youfing-secondary` com hover neon
- **Transição:** 300ms smooth

### Responsividade
- **Mobile:** Apenas ícones visíveis nas abas
- **Tablet+:** Labels visíveis nas abas
- **Desktop:** Layout completo com logo e texto

---

## 📖 Como Usar

### Uso Básico
```tsx
import { Navigator } from '@/components/young-finance';

export default function App() {
  return <Navigator />;
}
```

### Integrar no App.tsx
```tsx
import { Navigator } from '@/components/young-finance';

function App() {
  return (
    <div className="min-h-screen bg-youfing-primary">
      <Navigator />
    </div>
  );
}
```

### Adicionar uma Nova Aba
1. Criar um novo componente de aba (ex: `NewTab.tsx`):
   ```tsx
   export const NewTab: React.FC = () => {
     return <div>Conteúdo da nova aba</div>;
   };
   ```

2. Importar em `Navigator.tsx`:
   ```tsx
   import { NewTab } from './NewTab';
   ```

3. Adicionar ao array `TABS`:
   ```tsx
   const TABS: Tab[] = [
     // ... outras abas
     {
       id: 'new-tab',
       label: 'Nova Aba',
       icon: <Star size={18} />,
       component: NewTab,
     },
   ];
   ```

---

## 🔌 Integração com Componentes Base

### Dentro de uma Aba
Você pode usar qualquer componente base (BentoCard, SliderField, GrowthChart) dentro de uma aba:

```tsx
// AssistantTab.tsx
import { BentoCard, SliderField, GrowthChart } from './index';

export const AssistantTab: React.FC = () => {
  const [capital, setCapital] = useState(10000);

  return (
    <div className="p-8 space-y-6">
      <SliderField
        label="Capital"
        value={capital}
        min={1000}
        max={100000}
        step={1000}
        onChange={setCapital}
        prefix="R$"
      />
      
      <BentoCard
        label="Valor"
        value={`R$ ${capital}`}
        hint="Capital inicial"
        highlight={true}
      />
    </div>
  );
};
```

---

## 🎯 Estado da Navegação

O Navigator mantém o estado da aba ativa localmente. Para compartilhar estado entre abas ou com componentes externos, considere:

1. **Context API** - Para estado global
2. **URL (React Router)** - Para navegação por URL
3. **Props lifting** - Para componentes pais

### Exemplo com React Router
```tsx
// Futuro: integrar com React Router
import { useSearchParams } from 'react-router-dom';

export const Navigator: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const activeTab = params.get('tab') || 'assistant';
  
  const handleTabChange = (tabId: string) => {
    setParams({ tab: tabId });
  };
  
  // ...
};
```

---

## ♿ Acessibilidade

### Keyboard Navigation
- ✅ Tab para navegar entre abas
- ✅ Enter/Space para ativar aba
- ✅ Focus visível com outline neon

### Screen Readers
```tsx
<button
  onClick={() => setActiveTab(tab.id)}
  aria-selected={isActive}
  role="tab"
>
  {tab.label}
</button>
```

### Melhorias Futuras
- [ ] Adicionar `aria-label` e `aria-describedby`
- [ ] Implementar focus trap no header
- [ ] Adicionar `role="tablist"` e `role="tabpanel"`

---

## 🧪 Testabilidade

### Componente Puro
```tsx
// Fácil de testar com Vitest
import { render, screen } from '@testing-library/react';
import { Navigator } from './Navigator';

test('renders all tabs', () => {
  render(<Navigator />);
  expect(screen.getByText('Assistente')).toBeInTheDocument();
  expect(screen.getByText('Cenários')).toBeInTheDocument();
});

test('switches tabs on click', async () => {
  const { user } = render(<Navigator />);
  await user.click(screen.getByText('Cenários'));
  // Verificar se aba foi ativada
});
```

---

## 📁 Estrutura de Arquivos

```
src/components/young-finance/
├── Navigator.tsx          ← Componente principal de navegação
├── AssistantTab.tsx       ← Aba 1: Assistente
├── ScenariosTab.tsx       ← Aba 2: Cenários
├── InvestimentosTab.tsx   ← Aba 3: Investimentos
├── Hp12cTab.tsx           ← Aba 4: HP 12C
└── index.ts               ← Barrel export (atualizado)
```

---

## 🎯 Próximas Etapas

- [ ] Substituir placeholders das abas por conteúdo real
- [ ] Integrar BentoGrid (container responsivo)
- [ ] Adicionar persistência de aba ativa (localStorage)
- [ ] Conectar com React Router para navegação por URL
- [ ] Adicionar ícones animados nas abas
- [ ] Criar animação de transição entre abas

---

**Criado em:** 2026-05-27  
**Padrão:** YoungFinance Premium Dark Mode  
**Versão:** 1.0.0 (Beta)
