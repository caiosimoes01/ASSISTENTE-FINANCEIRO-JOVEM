/**
 * 📦 SHOWCASE: Como usar os componentes YoungFinance
 * Este arquivo é apenas para referência e demonstração
 * Pode ser deletado após uso
 */

import React, { useState } from 'react';
import { BentoCard, SliderField, GrowthChart } from './index';
import { TrendingUp, Wallet, Target } from 'lucide-react';

/**
 * ✅ EXEMPLO 1: BentoCard
 */
function BentoCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Card normal */}
      <BentoCard
        label="Capital Inicial"
        value="R$ 10.000"
        hint="Valor aportado no início"
        icon={<Wallet size={20} />}
      />

      {/* Card destacado (highlight) */}
      <BentoCard
        label="Rendimento Total"
        value="R$ 5.432,50"
        hint="Juros acumulados"
        icon={<TrendingUp size={20} />}
        highlight={true}
      />

      {/* Card sem icon */}
      <BentoCard
        label="Período"
        value="120 meses"
        hint="10 anos de investimento"
      />

      {/* Card customizado com className */}
      <BentoCard
        label="Meta"
        value="R$ 50.000"
        hint="Seu objetivo financeiro"
        icon={<Target size={20} />}
        className="lg:col-span-2"
      />
    </div>
  );
}

/**
 * ✅ EXEMPLO 2: SliderField
 */
function SliderFieldExample() {
  const [capitalInicial, setCapitalInicial] = useState(10000);
  const [aporteMensal, setAporteMensal] = useState(500);
  const [periodoMeses, setPeriodoMeses] = useState(60);

  return (
    <div className="space-y-6 bg-youfing-secondary p-6 rounded-2xl border border-youfing-light">
      <SliderField
        label="Capital Inicial"
        value={capitalInicial}
        min={1000}
        max={100000}
        step={1000}
        onChange={setCapitalInicial}
        prefix="R$"
      />

      <SliderField
        label="Aporte Mensal"
        value={aporteMensal}
        min={100}
        max={5000}
        step={100}
        onChange={setAporteMensal}
        prefix="R$"
      />

      <SliderField
        label="Período (meses)"
        value={periodoMeses}
        min={1}
        max={360}
        step={1}
        onChange={setPeriodoMeses}
        prefix=""
      />

      {/* Resumo dos valores */}
      <div className="pt-4 border-t border-youfing-light">
        <p className="text-xs text-youfing-tertiary mb-3">Seus valores:</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-youfing-secondary">Capital</p>
            <p className="text-accent font-semibold">
              R$ {capitalInicial.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-youfing-secondary">Aporte</p>
            <p className="text-accent font-semibold">
              R$ {aporteMensal.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-youfing-secondary">Período</p>
            <p className="text-accent font-semibold">
              {periodoMeses} meses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ✅ EXEMPLO 3: GrowthChart
 */
function GrowthChartExample() {
  // Dados simulados de projeção
  const chartData = [
    { mes: 0, valor: 10000 },
    { mes: 12, valor: 12850 },
    { mes: 24, valor: 15890 },
    { mes: 36, valor: 19234 },
    { mes: 48, valor: 23120 },
    { mes: 60, valor: 27650 },
    { mes: 72, valor: 32890 },
    { mes: 84, valor: 39120 },
    { mes: 96, valor: 46540 },
    { mes: 108, valor: 55230 },
    { mes: 120, valor: 65432 },
  ];

  return (
    <GrowthChart
      data={chartData}
      dataKeyX="mes"
      dataKeyY="valor"
      title="Projeção de Crescimento (12 meses)"
      height={350}
    />
  );
}

/**
 * 🎨 EXEMPLO COMPLETO: Simulador com todos os componentes
 */
export function YoungFinanceShowcase() {
  const [capitalInicial, setCapitalInicial] = useState(10000);
  const [aporteMensal, setAporteMensal] = useState(500);
  const [periodoMeses, setPeriodoMeses] = useState(60);

  // Simular cálculo de rendimento
  const valorFuturo = capitalInicial + aporteMensal * periodoMeses;
  const rendimento = valorFuturo - (capitalInicial + aporteMensal * periodoMeses);

  // Gerar dados do gráfico dinamicamente
  const generateChartData = () => {
    const months = Array.from({ length: periodoMeses / 12 + 1 }, (_, i) => i * 12);
    return months.map((month) => ({
      mes: month,
      valor: capitalInicial + aporteMensal * month * (1 + 0.08), // Simulação com 8% a.a
    }));
  };

  return (
    <div className="min-h-screen bg-youfing-primary p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-accent mb-2">
          YoungFinance - Simulador Premium
        </h1>
        <p className="text-youfing-secondary text-sm">
          Componentes isolados em padrão Bento Grid
        </p>
      </div>

      {/* Seção 1: Inputs com Sliders */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-youfing-primary">
          Parâmetros de Entrada
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SliderField
            label="Capital Inicial"
            value={capitalInicial}
            min={1000}
            max={100000}
            step={1000}
            onChange={setCapitalInicial}
            prefix="R$"
          />
          <SliderField
            label="Aporte Mensal"
            value={aporteMensal}
            min={100}
            max={5000}
            step={100}
            onChange={setAporteMensal}
            prefix="R$"
          />
          <SliderField
            label="Período (meses)"
            value={periodoMeses}
            min={1}
            max={360}
            step={1}
            onChange={setPeriodoMeses}
            prefix=""
          />
        </div>
      </section>

      {/* Seção 2: Resultados em Bento Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-youfing-primary">
          Seus Resultados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BentoCard
            label="Capital"
            value={`R$ ${capitalInicial.toLocaleString()}`}
            hint="Valor inicial"
            icon={<Wallet size={18} />}
          />
          <BentoCard
            label="Aportes"
            value={`R$ ${(aporteMensal * periodoMeses).toLocaleString()}`}
            hint="Total aportado"
            icon={<Target size={18} />}
          />
          <BentoCard
            label="Período"
            value={`${periodoMeses} meses`}
            hint={`${(periodoMeses / 12).toFixed(1)} anos`}
          />
          <BentoCard
            label="Valor Futuro"
            value={`R$ ${valorFuturo.toLocaleString()}`}
            hint="Projeção final"
            icon={<TrendingUp size={18} />}
            highlight={true}
          />
        </div>
      </section>

      {/* Seção 3: Gráfico de crescimento */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-youfing-primary">
          Projeção de Crescimento
        </h2>
        <GrowthChart
          data={generateChartData()}
          dataKeyX="mes"
          dataKeyY="valor"
          height={350}
        />
      </section>

      {/* Footer */}
      <div className="text-center pt-8 border-t border-youfing-light text-youfing-tertiary text-xs">
        <p>
          💡 Componentes isolados e reutilizáveis • Sem lógica de negócio
        </p>
        <p className="mt-2">
          🔒 Todos os componentes utilizam a paleta de cores Premium Dark Mode
        </p>
      </div>
    </div>
  );
}
