const FUSO_HORARIO = "America/Fortaleza";

export const LIMITE_DIAS_RESERVA = 15;

function formatarDataUtc(data: Date): string {
  const ano = data.getUTCFullYear();
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(data.getUTCDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function obterDataAtualFortaleza(agora: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_HORARIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(agora);

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value])
  );

  return `${valores.year}-${valores.month}-${valores.day}`;
}

export function obterDataLimiteReserva(agora: Date = new Date()): string {
  const [ano, mes, dia] = obterDataAtualFortaleza(agora)
    .split("-")
    .map(Number);

  const dataLimite = new Date(
    Date.UTC(ano, mes - 1, dia + LIMITE_DIAS_RESERVA, 12)
  );

  return formatarDataUtc(dataLimite);
}

export function inicioNoPassadoOuAgora(
  inicio: Date,
  agora: Date = new Date()
): boolean {
  return inicio.getTime() <= agora.getTime();
}

export function dataUltrapassaLimite(
  data: string,
  agora: Date = new Date()
): boolean {
  return data > obterDataLimiteReserva(agora);
}

export function podeEditarReserva(
  inicio: Date,
  agora: Date = new Date()
): boolean {
  return inicio.getTime() > agora.getTime();
}
