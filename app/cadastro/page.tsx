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
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">
          Cadastro concluído!
        </h1>

        <p className="mt-4 text-slate-600">
          Seu nome de usuário é:
        </p>

        <p className="mt-2 rounded-lg bg-slate-100 px-4 py-3 text-lg font-semibold text-slate-900">
          {estado.username}
        </p>

        <p className="mt-4 text-sm text-slate-600">
          Guarde esse nome de usuário: junto com o seu CPF, ele será usado
          para entrar no sistema.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
        >
          Continuar
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Cadastro</h1>

      <form action={acaoDoFormulario} className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="primeiroNome"
            className="block text-sm font-medium text-slate-700"
          >
            Primeiro nome
          </label>

          <input
            id="primeiroNome"
            name="primeiroNome"
            required
            autoComplete="given-name"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="ultimoNome"
            className="block text-sm font-medium text-slate-700"
          >
            Último nome
          </label>

          <input
            id="ultimoNome"
            name="ultimoNome"
            required
            autoComplete="family-name"
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
            autoComplete="new-password"
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
          {pendente ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Já tem uma conta?{" "}
        <Link href="/entrar" className="font-medium text-slate-900 underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
