# 🎨 TAILWIND COLORS CONFIG - Premium Dark Mode

## 📋 Paleta de Cores YoungFinance

Variáveis CSS para aplicar a identidade visual premium fintech com **fundo azul escuro/preto profundo** e **detalhes em verde neon**.

---

## 🖌️ Bloco CSS para injetar em `src/index.css`

Copie e cole tudo isto **no final** do arquivo `src/index.css` (após `@tailwind utilities;`):

```css
/* ==========================================
   YOUFINGFINANCE COLOR PALETTE - DARK MODE
   ========================================== */

:root {
  /* Cores de fundo base */
  --color-bg-primary: #0a0f1a;      /* Azul escuro profundo - fundo principal */
  --color-bg-secondary: #0f1629;    /* Azul levemente mais claro - cards e containers */
  --color-bg-tertiary: #151d2f;     /* Azul para camadas extras */
  
  /* Cores de texto */
  --color-text-primary: #ffffff;    /* Branco puro - texto principal */
  --color-text-secondary: #b0b8d4;  /* Cinza-azulado - texto secundário */
  --color-text-tertiary: #7a8299;   /* Cinza escuro - texto desabilitado */
  
  /* Cores de destaque - Verde Neon */
  --color-accent-primary: #00d084;  /* Verde neon vibrante - CTAs e highlights */
  --color-accent-dark: #00a863;     /* Verde neon escuro - hover states */
  --color-accent-light: #1ae89f;    /* Verde neon claro - accent suave */
  
  /* Cores de estado */
  --color-success: #00d084;         /* Sucesso - alinhado com accent */
  --color-warning: #ffb84d;         /* Alerta - laranja warm */
  --color-error: #ff6b6b;           /* Erro - vermelho vibrante */
  --color-info: #4d9eff;            /* Informação - azul claro */
  
  /* Bordas e divisões */
  --color-border: #1e2847;          /* Bordas sutis */
  --color-border-light: #2a3654;    /* Bordas mais visíveis */
  --color-border-accent: #00d084;   /* Bordas em destaque */
  
  /* Sombras e efeitos */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 16px rgba(0, 208, 132, 0.2);
  --shadow-glow-intense: 0 0 24px rgba(0, 208, 132, 0.35);
  
  /* Gradientes */
  --gradient-primary: linear-gradient(135deg, #0a0f1a 0%, #0f1629 50%, #151d2f 100%);
  --gradient-accent: linear-gradient(135deg, #00d084 0%, #1ae89f 100%);
  --gradient-card: linear-gradient(135deg, rgba(15, 22, 41, 0.8) 0%, rgba(21, 29, 47, 0.6) 100%);
}

.dark {
  /* Em modo dark (padrão para este projeto) */
  color-scheme: dark;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* ==========================================
   UTILITY CLASSES PARA RÁPIDA APLICAÇÃO
   ========================================== */

/* Fundos */
.bg-youfing-primary {
  background-color: var(--color-bg-primary);
}

.bg-youfing-secondary {
  background-color: var(--color-bg-secondary);
}

.bg-youfing-tertiary {
  background-color: var(--color-bg-tertiary);
}

/* Textos */
.text-youfing-primary {
  color: var(--color-text-primary);
}

.text-youfing-secondary {
  color: var(--color-text-secondary);
}

.text-youfing-tertiary {
  color: var(--color-text-tertiary);
}

/* Destaques */
.text-accent {
  color: var(--color-accent-primary);
}

.bg-accent {
  background-color: var(--color-accent-primary);
}

/* Bordas */
.border-youfing {
  border-color: var(--color-border);
}

.border-youfing-light {
  border-color: var(--color-border-light);
}

.border-accent {
  border-color: var(--color-border-accent);
}

/* Sombras */
.shadow-youfing-sm {
  box-shadow: var(--shadow-sm);
}

.shadow-youfing-md {
  box-shadow: var(--shadow-md);
}

.shadow-youfing-lg {
  box-shadow: var(--shadow-lg);
}

.shadow-youfing-glow {
  box-shadow: var(--shadow-glow);
}

.shadow-youfing-glow-intense {
  box-shadow: var(--shadow-glow-intense);
}

/* Gradientes */
.bg-gradient-youfing {
  background: var(--gradient-primary);
}

.bg-gradient-accent {
  background: var(--gradient-accent);
}

.bg-gradient-card {
  background: var(--gradient-card);
}

/* ==========================================
   APLICAÇÃO GLOBAL
   ========================================== */

html,
body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* Scrollbar customizado */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-accent-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-dark);
}

/* Focus states com destaque neon */
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}

/* Transições suaves */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
```

---

## 🎯 Como usar

### Opção 1: Classes utilitárias
```tsx
<div className="bg-youfing-primary text-youfing-primary">
  <button className="bg-accent text-white rounded px-4 py-2 shadow-youfing-glow">
    CTA Verde Neon
  </button>
</div>
```

### Opção 2: Variáveis CSS diretas
```css
.meu-elemento {
  background-color: var(--color-bg-secondary);
  color: var(--color-accent-primary);
  box-shadow: var(--shadow-glow-intense);
}
```

### Opção 3: Tailwind (com tailwind.config.js estendido)
```tsx
<div className="bg-youfing-secondary text-accent shadow-youfing-glow">
  Conteúdo premium
</div>
```

---

## 📊 Referência Rápida

| Elemento | Cor | Código |
|----------|-----|--------|
| Fundo principal | Azul escuro/preto | `#0a0f1a` |
| Fundo secundário | Azul levemente claro | `#0f1629` |
| Texto principal | Branco | `#ffffff` |
| Texto secundário | Cinza-azulado | `#b0b8d4` |
| Destaque | Verde neon | `#00d084` |
| Destaque claro | Verde neon claro | `#1ae89f` |

---

**Criado em:** 2026-05-27
**Padrão:** YoungFinance Premium Dark Mode
