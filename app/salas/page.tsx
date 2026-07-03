"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type Sala = {
    id: string;
    nome: string;
    capacidade: number;
    criada_em: string;
    pode_editar: boolean;
    pode_excluir: boolean;
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
    const [salaEmEdicaoId, setSalaEmEdicaoId] = useState<string | null>(
        null
    );
    const [salaSendoExcluidaId, setSalaSendoExcluidaId] =
        useState<string | null>(null);

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

    async function salvarSala(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();

        setSalvando(true);
        setErroFormulario("");
        setMensagem("");

        try {
            const editando = salaEmEdicaoId !== null;

            const resposta = await fetch(
                editando
                    ? `/api/salas/${salaEmEdicaoId}`
                    : "/api/salas",
                {
                    method: editando ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome,
                        capacidade: Number(capacidade),
                    }),
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ??
                    `Não foi possível ${editando ? "editar" : "cadastrar"
                    } a sala.`
                );
            }

            if (editando) {
                setSalas((salasAtuais) =>
                    salasAtuais.map((sala) =>
                        sala.id === resultado.id ? resultado : sala
                    )
                );

                setMensagem("Sala atualizada com sucesso.");
            } else {
                setSalas((salasAtuais) => [...salasAtuais, resultado]);
                setMensagem("Sala cadastrada com sucesso.");
            }

            setNome("");
            setCapacidade("");
            setSalaEmEdicaoId(null);
        } catch (erro) {
            setErroFormulario(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao salvar a sala."
            );
        } finally {
            setSalvando(false);
        }
    }

    function iniciarEdicao(sala: Sala) {
        if (!sala.pode_editar) {
            return;
        }

        setSalaEmEdicaoId(sala.id);
        setNome(sala.nome);
        setCapacidade(String(sala.capacidade));
        setErroFormulario("");
        setMensagem("");
    }

    function cancelarEdicao() {
        setSalaEmEdicaoId(null);
        setNome("");
        setCapacidade("");
        setErroFormulario("");
    }

    async function excluirSala(sala: Sala) {
        if (!sala.pode_excluir) {
            return;
        }

        const confirmou = window.confirm(
            `Deseja realmente excluir a sala "${sala.nome}"?`
        );

        if (!confirmou) {
            return;
        }

        setSalaSendoExcluidaId(sala.id);
        setErroFormulario("");
        setMensagem("");

        try {
            const resposta = await fetch(`/api/salas/${sala.id}`, {
                method: "DELETE",
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ?? "Não foi possível excluir a sala."
                );
            }

            setSalas((salasAtuais) =>
                salasAtuais.filter((salaAtual) => salaAtual.id !== sala.id)
            );

            if (salaEmEdicaoId === sala.id) {
                cancelarEdicao();
            }

            setMensagem("Sala excluída com sucesso.");
        } catch (erro) {
            setErroFormulario(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao excluir a sala."
            );
        } finally {
            setSalaSendoExcluidaId(null);
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
                        {salaEmEdicaoId ? "Editar sala" : "Cadastrar sala"}
                    </h2>

                    <form
                        onSubmit={salvarSala}
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

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={salvando}
                                className="rounded-lg bg-slate-900 px-5 py-2 font-medium text-white disabled:opacity-60"
                            >
                                {salvando
                                    ? "Salvando..."
                                    : salaEmEdicaoId
                                        ? "Atualizar"
                                        : "Cadastrar"}
                            </button>

                            {salaEmEdicaoId && (
                                <button
                                    type="button"
                                    onClick={cancelarEdicao}
                                    disabled={salvando}
                                    className="rounded-lg border border-slate-300 px-4 py-2 font-medium"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
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

                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium">
                                            {sala.capacidade} pessoas
                                        </span>

                                        {sala.pode_editar && (
                                            <button
                                                type="button"
                                                onClick={() => iniciarEdicao(sala)}
                                                disabled={salaSendoExcluidaId === sala.id}
                                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                                            >
                                                Editar
                                            </button>
                                        )}

                                        {sala.pode_excluir && (
                                            <button
                                                type="button"
                                                onClick={() => excluirSala(sala)}
                                                disabled={salaSendoExcluidaId === sala.id}
                                                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                                            >
                                                {salaSendoExcluidaId === sala.id
                                                    ? "Excluindo..."
                                                    : "Excluir"}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}