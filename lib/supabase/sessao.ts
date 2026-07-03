import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function obterConfiguracao() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "As variáveis SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY não foram configuradas."
    );
  }

  return { supabaseUrl, supabasePublishableKey };
}

export async function criarClienteDeSessao() {
  const { supabaseUrl, supabasePublishableKey } = obterConfiguracao();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaDefinir) {
        try {
          for (const { name, value, options } of cookiesParaDefinir) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Chamado a partir de um Server Component (somente leitura);
          // a sessão é renovada pelo proxy em requisições subsequentes.
        }
      },
    },
  });
}
