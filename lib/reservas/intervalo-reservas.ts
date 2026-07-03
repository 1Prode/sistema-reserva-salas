export const INTERVALO_ENTRE_RESERVAS_MINUTOS = 10;

function adicionarMinutos(data: Date, minutos: number): Date {
  return new Date(data.getTime() + minutos * 60 * 1000);
}

export function adicionarIntervaloAoFim(fim: Date): Date {
  return adicionarMinutos(fim, INTERVALO_ENTRE_RESERVAS_MINUTOS);
}

export function subtrairIntervaloDoInicio(inicio: Date): Date {
  return adicionarMinutos(inicio, -INTERVALO_ENTRE_RESERVAS_MINUTOS);
}

export function obterFimDaIndisponibilidade(fim: Date): Date {
  return adicionarIntervaloAoFim(fim);
}
