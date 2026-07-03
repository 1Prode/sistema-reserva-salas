import "server-only";
import { cache } from "react";
import { criarClienteDeSessao } from "@/lib/supabase/sessao";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type Papel = "usuario" | "admin";

export type Sessao = {
  id: string;
  username: string;
  nome: string;
  papel: Papel;
};

export const obterSessao = cache(async (): Promise<Sessao | null> => {
  const supabase = await criarClienteDeSessao();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: perfil, error: erroPerfil } = await supabaseServidor
    .from("perfis")
    .select("username, nome, papel")
    .eq("id", user.id)
    .maybeSingle();

  if (erroPerfil || !perfil) {
    return null;
  }

  if (typeof perfil.username !== "string" || !perfil.username) {
    return null;
  }

  if (typeof perfil.nome !== "string") {
    return null;
  }

  const nomeNormalizado = perfil.nome.trim();

  if (!nomeNormalizado) {
    return null;
  }

  if (perfil.papel !== "usuario" && perfil.papel !== "admin") {
    return null;
  }

  return {
    id: user.id,
    username: perfil.username,
    nome: nomeNormalizado,
    papel: perfil.papel,
  };
});
