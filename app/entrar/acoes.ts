"use server";

import { redirect } from "next/navigation";
import { criarClienteDeSessao } from "@/lib/supabase/sessao";
import { cpfValido, normalizarCpf } from "@/lib/auth/cpf";
import {
  montarEmailTecnico,
  normalizarUsername,
  usernameValido,
} from "@/lib/auth/nome";

export type EstadoLogin =
  | { status: "inicial" }
  | { status: "erro"; mensagem: string };

const MENSAGEM_CREDENCIAIS_INVALIDAS =
  "Nome de usuário ou CPF inválidos.";

export async function entrar(
  _estadoAnterior: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const username = normalizarUsername(String(formData.get("username") ?? ""));
  const cpf = String(formData.get("cpf") ?? "");

  if (!usernameValido(username)) {
    return { status: "erro", mensagem: MENSAGEM_CREDENCIAIS_INVALIDAS };
  }

  if (!cpfValido(cpf)) {
    return { status: "erro", mensagem: MENSAGEM_CREDENCIAIS_INVALIDAS };
  }

  const cpfNormalizado = normalizarCpf(cpf);

  const supabase = await criarClienteDeSessao();

  const { error } = await supabase.auth.signInWithPassword({
    email: montarEmailTecnico(username),
    password: cpfNormalizado,
  });

  if (error) {
    return { status: "erro", mensagem: MENSAGEM_CREDENCIAIS_INVALIDAS };
  }

  redirect("/");
}
