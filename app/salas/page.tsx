"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type Sala = {
    id: string;
    nome: string;
    capacidade: number;
    criada_em: string;
};

export default function PaginaDeSalas() {
    const [salas, setSalas] = useState<Sala[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [nome, setNome] = useState("");
    const [capacidade, setCapacidade] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        async function carregarSalas() {
            try {
                const resposta = await fetch("/api/salas", {
                    cache: "no-store",
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        resultado.erro ?? "Não foi possível carregar as salas."
                    );
                }

                setSalas(resultado);
            } catch (erro) {
                setErro(
                    erro instanceof Error
                        ? erro.message
                        : "Ocorreu um erro ao carregar as salas."
                );
            } finally {
                setCarregando(false);
            }
        }

        void carregarSalas();
    }, []);

    async function cadastrarSala(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        setSalvando(true);
        setErroFormulario("");
        setMensagem("");

        try {
            const resposta = await fetch("/api/salas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome,
                    capacidade: Number(capacidade),
                }),
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ?? "Não foi possível cadastrar a sala."
                );
            }

            setSalas((salasAtuais) => [...salasAtuais, resultado]);
            setNome("");
            setCapacidade("");
            setMensagem("Sala cadastrada com sucesso.");
        } catch (erro) {
            setErroFormulario(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao cadastrar a sala."
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Salas</h1>

                    <p className="mt-2 text-slate-600">
                        Consulte as salas disponíveis para reserva.
                    </p>
                </header>

                <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold">
                        Cadastrar sala
                    </h2>

                    <form
                        onSubmit={cadastrarSala}
                        className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end"
                    >
                        <div>
                            <label
                                htmlFor="nome"
                                className="mb-2 block text-sm font-medium"
                            >
                                Nome da sala
                            </label>

                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(evento) => setNome(evento.target.value)}
                                placeholder="Ex.: Sala de Treinamento"
                                required
                                maxLength={100}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="capacidade"
                                className="mb-2 block text-sm font-medium"
                            >
                                Capacidade
                            </label>

                            <input
                                id="capacidade"
                                type="number"
                                value={capacidade}
                                onChange={(evento) => setCapacidade(evento.target.value)}
                                placeholder="Ex.: 20"
                                required
                                min={1}
                                step={1}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={salvando}
                            className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white disabled:opacity-60"
                        >
                            {salvando ? "Salvando..." : "Cadastrar"}
                        </button>
                    </form>

                    {erroFormulario && (
                        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            {erroFormulario}
                        </p>
                    )}

                    {mensagem && (
                        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {mensagem}
                        </p>
                    )}
                </section>

                <section className="rounded-xl bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Salas cadastradas
                        </h2>

                        <span className="text-sm text-slate-500">
                            {salas.length} sala(s)
                        </span>
                    </div>

                    {carregando && (
                        <p className="text-slate-600">
                            Carregando salas...
                        </p>
                    )}

                    {erro && (
                        <p className="rounded-lg bg-red-50 p-3 text-red-700">
                            {erro}
                        </p>
                    )}

                    {!carregando && !erro && salas.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                            Nenhuma sala cadastrada.
                        </div>
                    )}

                    {!carregando && !erro && salas.length > 0 && (
                        <ul className="space-y-3">
                            {salas.map((sala) => (
                                <li
                                    key={sala.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                                >
                                    <div>
                                        <h3 className="font-semibold">
                                            {sala.nome}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            ID: {sala.id}
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                                        {sala.capacidade} pessoas
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}