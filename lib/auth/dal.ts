import "server-only";
import { cache } from "react";
import { criarClienteDeSessao } from "@/lib/supabase/sessao";
import { supabaseServidor } from "@/lib/supabase/servidor";

export type Papel = "usuario" | "admin";

export type Sessao = {
  id: string;
  username: string;
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
    .select("username, papel")
    .eq("id", user.id)
    .maybeSingle();

  if (erroPerfil || !perfil) {
    return null;
  }

  if (perfil.papel !== "usuario" && perfil.papel !== "admin") {
    return null;
  }

  return {
    id: user.id,
    username: perfil.username,
    papel: perfil.papel,
  };
});
