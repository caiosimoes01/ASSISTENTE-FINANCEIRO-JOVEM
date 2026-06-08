export interface BCBResponse {
  data: string;
  valor: string;
}

/**
 * Busca a taxa SELIC acumulada anualizada mais recente do Banco Central
 */
export async function fetchCurrentSelic(): Promise<number> {
  try {
    // Código 11: Taxa SELIC acumulada no mês anualizada % a.a.
    const response = await fetch(
      "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json"
    );

    if (!response.ok) throw new Error("Erro ao consultar o Banco Central");

    const dados: BCBResponse[] = await response.json();

    if (dados && dados.length > 0) {
      // Pega o último registro disponível (o mais recente)
      const ultimoRegistro = dados[dados.length - 1];
      return parseFloat(ultimoRegistro.valor);
    }

    // Fallback seguro caso a API falhe (ajuste para a taxa atual)
    return 10.5;
  } catch (error) {
    console.error(
      "Falha ao buscar indicadores do BCB, usando fallback:",
      error
    );
    return 10.5; // Fallback
  }
}
