import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { obterSessao } from "@/lib/auth/dal";
import { sair } from "@/lib/auth/acoes";

export const metadata: Metadata = {
  title: "Sistema de Reserva de Salas",
  description: "Gerenciamento de salas e reservas",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessao = await obterSessao();

  return (
    <html lang="pt-BR">
      <body className="bg-slate-100 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link
              href="/"
              className="text-lg font-bold text-slate-900"
            >
              Sistema de Reserva de Salas
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/salas"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Salas
              </Link>

              <Link
                href="/reservas"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Reservas
              </Link>

              {sessao ? (
                <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    @{sessao.username}
                    {sessao.papel === "admin" && (
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                        Admin
                      </span>
                    )}
                  </span>

                  <form action={sair}>
                    <button
                      type="submit"
                      className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Sair
                    </button>
                  </form>
                </div>
              ) : (
                <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
                  <Link
                    href="/entrar"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Entrar
                  </Link>

                  <Link
                    href="/cadastro"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    Cadastre-se
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}