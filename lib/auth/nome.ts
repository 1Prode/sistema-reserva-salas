const DOMINIO_EMAIL_TECNICO = "reserva-salas.invalid";

const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

const FORMATO_USERNAME = /^[a-z]+[.][a-z]+[0-9]*$/;

const TAMANHO_MINIMO_USERNAME = 3;
const TAMANHO_MAXIMO_USERNAME = 80;

export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(MARCAS_DIACRITICAS, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function normalizarUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function usernameValido(username: string): boolean {
  return (
    username.length >= TAMANHO_MINIMO_USERNAME &&
    username.length <= TAMANHO_MAXIMO_USERNAME &&
    FORMATO_USERNAME.test(username)
  );
}

export function gerarUsernameBase(
  primeiroNome: string,
  ultimoNome: string
): string | null {
  const primeiro = normalizarNome(primeiroNome);
  const ultimo = normalizarNome(ultimoNome);

  if (!primeiro || !ultimo) {
    return null;
  }

  const base = `${primeiro}.${ultimo}`;

  if (base.length > TAMANHO_MAXIMO_USERNAME) {
    return null;
  }

  return base;
}

export function montarEmailTecnico(username: string): string {
  return `${username}@${DOMINIO_EMAIL_TECNICO}`;
}
