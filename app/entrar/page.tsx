"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./acoes";

const estadoInicial: EstadoLogin = { status: "inicial" };

export default function PaginaDeLogin() {
  const [estado, acaoDoFormulario, pendente] = useActionState(
    entrar,
    estadoInicial
  );

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            RS
          </span>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Acesse sua conta
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Entre para criar e gerenciar suas reservas.
          </p>
        </div>

        <form
          action={acaoDoFormulario}
          className="mt-8 flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="username"
              className="text-sm font-medium text-slate-700"
            >
              Nome de usuário
            </label>

            <input
              id="username"
              name="username"
              required
              autoComplete="username"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="cpf"
              className="text-sm font-medium text-slate-700"
            >
              CPF
            </label>

            <input
              id="cpf"
              name="cpf"
              type="password"
              required
              inputMode="numeric"
              autoComplete="current-password"
              placeholder="000.000.000-00"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {estado.status === "erro" && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {estado.mensagem}
            </p>
          )}

          <button
            type="submit"
            disabled={pendente}
            className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendente ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Não possui uma conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </main>
  );
}
