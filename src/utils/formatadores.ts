/**
 * Formats a number to Brazilian currency (R$).
 * If value is 1 million or more, formats as "R$ X,XXM" for UI elegance.
 */
export const formatCurrency = (value: number): string => {
  if (!isFinite(value) || isNaN(value)) return "R$ —";
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(2).replace(".", ",")}${"M"}`;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0, // In standard simulations, rounding to whole Reais is cleaner
  }).format(value);
};

/**
 * Formats a number to percentage format.
 * (e.g. 10.5 -> "10,5%")
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (!isFinite(value) || isNaN(value)) return "—%";
  return `${value.toFixed(decimals).replace(".", ",")}%`;
};

/**
 * Parses a BRL currency string (e.g., "1.500,00" or "R$ 300") back to a float number.
 */
export const parseBRL = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return parseFloat(value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "")) || 0;
};

/**
 * Formats a number of months into a human-friendly string in Portuguese (e.g. "1 ano e 3 meses")
 */
export const formatTimeSpan = (months: number): string => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const parts = [];
  
  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "ano" : "anos"}`);
  }
  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`);
  }
  
  return parts.filter(Boolean).join(" e ");
};
