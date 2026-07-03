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
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Entrar</h1>

      <form action={acaoDoFormulario} className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-slate-700"
          >
            Nome de usuário
          </label>

          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="cpf"
            className="block text-sm font-medium text-slate-700"
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
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        {estado.status === "erro" && (
          <p className="text-sm text-red-600">{estado.mensagem}</p>
        )}

        <button
          type="submit"
          disabled={pendente}
          className="mt-2 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pendente ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Ainda não tem uma conta?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-slate-900 underline"
        >
          Cadastre-se
        </Link>
      </p>
    </main>
  );
}
