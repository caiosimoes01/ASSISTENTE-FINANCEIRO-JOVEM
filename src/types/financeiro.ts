
export interface SimulationInputs {
  valorInicial: number;
  aporteMensal: number;
  prazoAnos: number;
  taxaAnual: number;
  inflacaoAnual: number;
}

export interface SnapshotMensal {
  mes: number;
  capital: number;
  juros: number;
  total: number;
}

export interface SimulationOutputs {
  patrimonioLiquido: number;
  patrimonioReal: number;
  totalInvestido: number;
  totalJuros: number;
  tabelaMesAMes: SnapshotMensal[];
}
