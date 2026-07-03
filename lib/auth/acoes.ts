"use server";

import { redirect } from "next/navigation";
import { criarClienteDeSessao } from "@/lib/supabase/sessao";

export async function sair() {
  const supabase = await criarClienteDeSessao();

  await supabase.auth.signOut();

  redirect("/entrar");
}
