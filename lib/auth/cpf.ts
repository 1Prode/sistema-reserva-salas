const FORMATO_SOMENTE_DIGITOS = /^\d{11}$/;
const FORMATO_AGRUPADO = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

function possuiFormatoAceitavel(cpf: string): boolean {
  return FORMATO_SOMENTE_DIGITOS.test(cpf) || FORMATO_AGRUPADO.test(cpf);
}

export function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

function calcularDigitoVerificador(
  cpf: string,
  quantidadeDigitos: number
): number {
  let soma = 0;

  for (let indice = 0; indice < quantidadeDigitos; indice++) {
    soma += Number(cpf[indice]) * (quantidadeDigitos + 1 - indice);
  }

  const resto = (soma * 10) % 11;

  return resto === 10 ? 0 : resto;
}

export function cpfValido(cpf: string): boolean {
  if (!possuiFormatoAceitavel(cpf)) {
    return false;
  }

  const cpfNormalizado = normalizarCpf(cpf);

  // CPFs com todos os dígitos iguais (000.000.000-00, 111.111.111-11 etc.)
  // passam no cálculo dos dígitos verificadores, mas nunca são válidos.
  if (/^(\d)\1{10}$/.test(cpfNormalizado)) {
    return false;
  }

  const primeiroDigitoEsperado = calcularDigitoVerificador(cpfNormalizado, 9);
  const segundoDigitoEsperado = calcularDigitoVerificador(cpfNormalizado, 10);

  return (
    primeiroDigitoEsperado === Number(cpfNormalizado[9]) &&
    segundoDigitoEsperado === Number(cpfNormalizado[10])
  );
}
