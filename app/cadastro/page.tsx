"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cadastrar, type EstadoCadastro } from "./acoes";

const estadoInicial: EstadoCadastro = { status: "inicial" };

export default function PaginaDeCadastro() {
  const [estado, acaoDoFormulario, pendente] = useActionState(
    cadastrar,
    estadoInicial
  );

  if (estado.status === "sucesso") {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              RS
            </span>

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Cadastro concluído!
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Seu nome de usuário é:
            </p>
          </div>

          <p className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {estado.username}
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Guarde esse nome de usuário: junto com o seu CPF, ele será usado
            para entrar no sistema.
          </p>

          <Link
            href="/"
            className="mt-6 block w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Continuar
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            RS
          </span>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Crie sua conta
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Cadastre-se para criar e gerenciar reservas.
          </p>
        </div>

        <form
          action={acaoDoFormulario}
          className="mt-8 flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="primeiroNome"
              className="text-sm font-medium text-slate-700"
            >
              Primeiro nome
            </label>

            <input
              id="primeiroNome"
              name="primeiroNome"
              required
              autoComplete="given-name"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="ultimoNome"
              className="text-sm font-medium text-slate-700"
            >
              Último nome
            </label>

            <input
              id="ultimoNome"
              name="ultimoNome"
              required
              autoComplete="family-name"
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
              autoComplete="new-password"
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
            {pendente ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Já possui uma conta?{" "}
          <Link
            href="/entrar"
            className="font-medium text-slate-900 underline-offset-2 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
