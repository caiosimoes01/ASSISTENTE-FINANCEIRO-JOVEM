/**
 * Utilitário para mesclar classes CSS condicionalmente
 * Similar a classnames/clsx - facilita uso de Tailwind com lógica condicional
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter((cls): cls is string => Boolean(cls))
    .join(' ');
}
