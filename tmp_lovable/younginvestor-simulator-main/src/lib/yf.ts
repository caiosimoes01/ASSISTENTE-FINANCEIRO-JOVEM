export const fmtBRL = (v: number) =>
  (isFinite(v) ? v : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export interface SimInput {
  initial: number;
  monthly: number;
  years: number;
  ratePct: number; // annual %
}

export interface SimResult {
  totalInvested: number;
  finalAmount: number;
  interest: number;
  series: { year: number; total: number; invested: number }[];
  doubleMonths: number | null;
  zeroPointMonths: number | null;
  monthlyRate: number;
}

export function simulate({ initial, monthly, years, ratePct }: SimInput): SimResult {
  const months = Math.max(0, Math.round(years * 12));
  const i = Math.pow(1 + ratePct / 100, 1 / 12) - 1;
  let balance = initial;
  let invested = initial;
  let doubleMonths: number | null = null;
  let zeroPointMonths: number | null = null;
  const series: SimResult["series"] = [{ year: 0, total: initial, invested: initial }];

  for (let m = 1; m <= months; m++) {
    const yield_ = balance * i;
    balance = balance + yield_ + monthly;
    invested += monthly;
    if (zeroPointMonths === null && yield_ >= monthly && monthly > 0) zeroPointMonths = m;
    if (doubleMonths === null && balance >= invested * 2 && invested > 0) doubleMonths = m;
    if (m % 12 === 0) series.push({ year: m / 12, total: Math.round(balance), invested: Math.round(invested) });
  }

  const finalAmount = Math.round(balance);
  const totalInvested = Math.round(invested);
  return {
    totalInvested,
    finalAmount,
    interest: Math.max(0, finalAmount - totalInvested),
    series,
    doubleMonths,
    zeroPointMonths,
    monthlyRate: i,
  };
}

export function formatMonths(m: number | null): string {
  if (m === null) return "—";
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo}m`;
  if (mo === 0) return `${y}a`;
  return `${y}a ${mo}m`;
}
