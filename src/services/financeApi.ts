/**
 * Interface que representa a estrutura de retorno da API do Banco Central (SGS)
 */
export interface BacenResponseItem {
  data: string;  // Formato: "dd/mm/aaaa"
  valor: string; // Formato numérico em string (ex: "10.50")
}

/**
 * Códigos das séries temporais oficiais do Banco Central (SGS)
 */
export const BACEN_SERIES = {
  CDI_DIARIO: 12,          // CDI diário
  CDI_ANUAL: 4389,         // CDI acumulado anualizado (base 252)
  IPCA_MENSAL: 433,        // IPCA mensal
  IPCA_12M: 13522,         // IPCA acumulado 12 meses
  SELIC_DIARIA: 11,        // SELIC diária
  SELIC_META_ANUAL: 1178,  // Meta SELIC definida pelo COPOM
} as const;

/**
 * Mapeamento de taxas padrão de Fallback (Segurança) caso a API do Bacen esteja fora do ar.
 * Garante que a experiência do usuário não seja interrompida.
 */
const FALLBACK_RATES: Record<number, number> = {
  [BACEN_SERIES.CDI_DIARIO]: 10.50,     // Retorna taxa anualizada por conveniência da simulação
  [BACEN_SERIES.CDI_ANUAL]: 10.50,      // CDI Anual padrão
  [BACEN_SERIES.IPCA_MENSAL]: 0.35,     // IPCA mensal médio (~4.2% a.a.)
  [BACEN_SERIES.IPCA_12M]: 4.50,        // IPCA 12 meses padrão
  [BACEN_SERIES.SELIC_DIARIA]: 10.50,
  [BACEN_SERIES.SELIC_META_ANUAL]: 10.50,
};

/**
 * Retorna uma taxa padrão de segurança caso a API falhe.
 * @param serieId ID da série do Banco Central
 */
export function getFallbackRate(serieId: number): number {
  if (serieId in FALLBACK_RATES) {
    return FALLBACK_RATES[serieId];
  }
  
  // Se for uma série desconhecida de CDI, assume 10.50
  if (serieId.toString().includes('12') || serieId.toString().includes('4389') || serieId.toString().includes('1178')) {
    return 10.50;
  }
  
  // Se for uma série desconhecida de IPCA, assume 4.50
  if (serieId.toString().includes('433') || serieId.toString().includes('13522')) {
    return 4.50;
  }

  // Fallback padrão genérico seguro
  return 4.50;
}

/**
 * Busca uma taxa econômica diretamente do Sistema Gerenciador de Séries Temporais (SGS) do Banco Central.
 * 
 * @param serieId O ID da série temporal no Bacen (ex: 12 para CDI diário, 433 para IPCA mensal)
 * @returns A última taxa disponível como número decimal
 */
export async function fetchBacenRate(serieId: number): Promise<number> {
  // Acessando a variável de ambiente no Vite via import.meta.env
  const baseUrl = import.meta.env.VITE_BACEN_SGS_BASE_URL || 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';
  
  // A URL oficial do Bacen SGS concatena com um ponto antes do ID da série, ex:
  // https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json
  // Garantimos a formatação correta independente de barra ou ponto final no final da URL base
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const url = `${cleanBaseUrl}.${serieId}/dados?formato=json`;

  try {
    // Definimos um timeout de 8 segundos para evitar que a chamada trave a aplicação indefinitivamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro HTTP! Status: ${response.status} ao acessar série ${serieId}`);
    }

    const data = (await response.json()) as unknown;

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Formato de resposta inválido ou dados vazios para a série ${serieId}`);
    }

    // A resposta do Bacen vem ordenada cronologicamente, pegamos o último item disponível (mais recente)
    const lastItem = data[data.length - 1] as unknown;

    if (!lastItem || typeof lastItem !== 'object' || !('valor' in lastItem) || !('data' in lastItem)) {
      throw new Error(`Dados de retorno inválidos na última posição da série ${serieId}`);
    }

    const typedItem = lastItem as BacenResponseItem;
    
    // Tratamento e conversão de valor de string para número.
    // A API do Bacen pode retornar com separador decimal de ponto ou vírgula dependendo da série/retorno,
    // substituímos vírgulas por pontos por garantia.
    const cleanValue = typedItem.valor.replace(',', '.');
    const parsedRate = parseFloat(cleanValue);

    if (isNaN(parsedRate)) {
      throw new Error(`O valor retornado '${typedItem.valor}' não pôde ser convertido em número para a série ${serieId}`);
    }

    return parsedRate;
  } catch (error) {
    const fallback = getFallbackRate(serieId);
    
    // Avisa no console em ambiente de dev/prod, sem travar a aplicação
    console.warn(
      `⚠️ [Bacen Service Warning]: Não foi possível obter os dados em tempo real da série ${serieId} da API do Bacen. ` +
      `Usando fallback seguro de ${fallback}%. Detalhes do erro:`,
      error instanceof Error ? error.message : error
    );
    
    return fallback;
  }
}

/**
 * Função utilitária especializada para buscar o CDI acumulado anualizado em tempo real.
 * @returns Promise com o CDI atual (ex: 10.50)
 */
export async function fetchCDI(): Promise<number> {
  return fetchBacenRate(BACEN_SERIES.CDI_ANUAL);
}

/**
 * Função utilitária especializada para buscar o IPCA acumulado dos últimos 12 meses.
 * @returns Promise com o IPCA atual (ex: 4.50)
 */
export async function fetchIPCA(): Promise<number> {
  return fetchBacenRate(BACEN_SERIES.IPCA_12M);
}
