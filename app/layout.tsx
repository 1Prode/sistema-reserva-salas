import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistema de Reserva de Salas",
  description: "Gerenciamento de salas e reservas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}