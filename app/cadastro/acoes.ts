"use server";

import { criarClienteDeSessao } from "@/lib/supabase/sessao";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { cpfValido, normalizarCpf } from "@/lib/auth/cpf";
import { gerarUsernameBase, montarEmailTecnico } from "@/lib/auth/nome";

export type EstadoCadastro =
  | { status: "inicial" }
  | { status: "erro"; mensagem: string }
  | { status: "sucesso"; username: string };

const MAX_TENTATIVAS_USERNAME = 5;
const TAMANHO_MINIMO_NOME = 2;
const TAMANHO_MAXIMO_NOME = 150;

function normalizarEspacos(valor: string): string {
  return valor.trim().replace(/\s+/g, " ");
}

async function gerarUsernameDisponivel(base: string): Promise<string> {
  const { data, error } = await supabaseServidor
    .from("perfis")
    .select("username")
    .ilike("username", `${base}%`);

  if (error) {
    throw new Error(
      "Não foi possível verificar a disponibilidade do nome de usuário."
    );
  }

  const existentes = new Set((data ?? []).map((linha) => linha.username));

  if (!existentes.has(base)) {
    return base;
  }

  let maiorSufixo = 1;

  for (const username of existentes) {
    if (username === base) {
      continue;
    }

    const resto = username.slice(base.length);

    if (/^[0-9]+$/.test(resto)) {
      maiorSufixo = Math.max(maiorSufixo, Number(resto));
    }
  }

  return `${base}${maiorSufixo + 1}`;
}

export async function cadastrar(
  _estadoAnterior: EstadoCadastro,
  formData: FormData
): Promise<EstadoCadastro> {
  const primeiroNome = String(formData.get("primeiroNome") ?? "");
  const ultimoNome = String(formData.get("ultimoNome") ?? "");
  const cpf = String(formData.get("cpf") ?? "");

  const base = gerarUsernameBase(primeiroNome, ultimoNome);

  if (!base) {
    return {
      status: "erro",
      mensagem: "Informe um primeiro nome e um último nome válidos.",
    };
  }

  if (!cpfValido(cpf)) {
    return { status: "erro", mensagem: "CPF inválido." };
  }

  const nomeCompleto = normalizarEspacos(
    `${primeiroNome.trim()} ${ultimoNome.trim()}`
  );

  if (
    nomeCompleto.length < TAMANHO_MINIMO_NOME ||
    nomeCompleto.length > TAMANHO_MAXIMO_NOME
  ) {
    return {
      status: "erro",
      mensagem: "Informe um nome completo válido.",
    };
  }

  const cpfNormalizado = normalizarCpf(cpf);
  const supabase = await criarClienteDeSessao();

  for (
    let tentativa = 0;
    tentativa < MAX_TENTATIVAS_USERNAME;
    tentativa++
  ) {
    let username: string;

    try {
      username = await gerarUsernameDisponivel(base);
    } catch {
      return {
        status: "erro",
        mensagem: "Não foi possível concluir o cadastro.",
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: montarEmailTecnico(username),
      password: cpfNormalizado,
      options: {
        data: { username, nome: nomeCompleto },
      },
    });

    if (!error) {
      if (data.user && data.session) {
        return { status: "sucesso", username };
      }

      return {
        status: "erro",
        mensagem: "Não foi possível concluir o cadastro.",
      };
    }

    if (error.code !== "user_already_exists") {
      console.error("Erro ao cadastrar usuário. Código:", error.code);

      return {
        status: "erro",
        mensagem: "Não foi possível concluir o cadastro.",
      };
    }
  }

  return {
    status: "erro",
    mensagem: "Não foi possível concluir o cadastro. Tente novamente.",
  };
}
