"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

type Sala = {
    id: string;
    nome: string;
    capacidade: number;
};

type Reserva = {
    id: string;
    sala_id: string;
    titulo: string;
    responsavel: string;
    participantes: number;
    inicio: string;
    fim: string;
    duracao_minutos: number;
    criada_em: string;
    sala: Sala | null;
};

type EstadoDaReserva = "Próxima" | "Em andamento" | "Encerrada";

function obterEstadoDaReserva(
    reserva: Reserva,
    horarioAtual: Date
): EstadoDaReserva {
    const inicio = new Date(reserva.inicio);
    const fim = new Date(reserva.fim);

    if (horarioAtual < inicio) {
        return "Próxima";
    }

    if (horarioAtual >= inicio && horarioAtual < fim) {
        return "Em andamento";
    }

    return "Encerrada";
}

function formatarData(dataIso: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(dataIso));
}

function obterClasseDoEstado(estado: EstadoDaReserva) {
    if (estado === "Em andamento") {
        return "bg-green-100 text-green-700";
    }

    if (estado === "Próxima") {
        return "bg-blue-100 text-blue-700";
    }

    return "bg-slate-100 text-slate-600";
}

function gerarHorarios(duracaoMinutos: number) {
    const horarios: string[] = [];

    const inicioFuncionamento = 8 * 60;
    const ultimoInicio = 21 * 60 - duracaoMinutos;

    for (
        let minutos = inicioFuncionamento;
        minutos <= ultimoInicio;
        minutos += 10
    ) {
        const hora = Math.floor(minutos / 60);
        const minuto = minutos % 60;

        horarios.push(
            `${String(hora).padStart(2, "0")}:${String(minuto).padStart(
                2,
                "0"
            )}`
        );
    }

    return horarios;
}

export default function PaginaDeReservas() {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [horarioAtual, setHorarioAtual] = useState(new Date());
    const [salas, setSalas] = useState<Sala[]>([]);

    const [salaId, setSalaId] = useState("");
    const [titulo, setTitulo] = useState("");
    const [responsavel, setResponsavel] = useState("");
    const [participantes, setParticipantes] = useState("");
    const [data, setData] = useState("");
    const [horarioInicio, setHorarioInicio] = useState("");
    const [duracaoMinutos, setDuracaoMinutos] = useState("30");

    const [salvando, setSalvando] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [salaFiltroId, setSalaFiltroId] = useState("");

    const horariosDisponiveis = gerarHorarios(
        Number(duracaoMinutos)
    );

    const reservasFiltradas = salaFiltroId
        ? reservas.filter(
            (reserva) => reserva.sala_id === salaFiltroId
        )
        : reservas;

    useEffect(() => {
        async function carregarReservas() {
            try {
                const resposta = await fetch("/api/reservas", {
                    cache: "no-store",
                });

                const resultado = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        resultado.erro ?? "Não foi possível carregar as reservas."
                    );
                }

                setReservas(resultado);
            } catch (erro) {
                setErro(
                    erro instanceof Error
                        ? erro.message
                        : "Ocorreu um erro ao carregar as reservas."
                );
            } finally {
                setCarregando(false);
            }
        }

        void carregarReservas();
    }, []);

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
                setErroFormulario(
                    erro instanceof Error
                        ? erro.message
                        : "Ocorreu um erro ao carregar as salas."
                );
            }
        }

        void carregarSalas();
    }, []);

    useEffect(() => {
        const intervalo = window.setInterval(() => {
            setHorarioAtual(new Date());
        }, 60_000);

        return () => window.clearInterval(intervalo);
    }, []);

    async function cadastrarReserva(
        evento: FormEvent<HTMLFormElement>
    ) {
        evento.preventDefault();

        setSalvando(true);
        setErroFormulario("");
        setMensagem("");

        try {
            const resposta = await fetch("/api/reservas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sala_id: salaId,
                    titulo,
                    responsavel,
                    participantes: Number(participantes),
                    data,
                    horario_inicio: horarioInicio,
                    duracao_minutos: Number(duracaoMinutos),
                }),
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ?? "Não foi possível criar a reserva."
                );
            }

            const salaSelecionada =
                salas.find((sala) => sala.id === salaId) ?? null;

            const novaReserva: Reserva = {
                ...resultado,
                sala: salaSelecionada,
            };

            setReservas((reservasAtuais) =>
                [...reservasAtuais, novaReserva].sort(
                    (reservaA, reservaB) =>
                        new Date(reservaA.inicio).getTime() -
                        new Date(reservaB.inicio).getTime()
                )
            );

            setTitulo("");
            setResponsavel("");
            setParticipantes("");
            setData("");
            setHorarioInicio("");
            setDuracaoMinutos("30");

            setMensagem("Reserva criada com sucesso.");
        } catch (erro) {
            setErroFormulario(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao criar a reserva."
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold">Reservas</h1>

                    <p className="mt-2 text-slate-600">
                        Consulte as reservas cadastradas e seus horários.
                    </p>
                </header>

                <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold">
                        Nova reserva
                    </h2>

                    {salas.length === 0 && (
                        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                            É necessário cadastrar pelo menos uma sala antes de criar
                            uma reserva.
                        </p>
                    )}

                    <form
                        onSubmit={cadastrarReserva}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <div>
                            <label
                                htmlFor="sala"
                                className="mb-2 block text-sm font-medium"
                            >
                                Sala
                            </label>

                            <select
                                id="sala"
                                value={salaId}
                                onChange={(evento) => setSalaId(evento.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            >
                                <option value="">Selecione uma sala</option>

                                {salas.map((sala) => (
                                    <option key={sala.id} value={sala.id}>
                                        {sala.nome} — capacidade: {sala.capacidade}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="titulo"
                                className="mb-2 block text-sm font-medium"
                            >
                                Título
                            </label>

                            <input
                                id="titulo"
                                type="text"
                                value={titulo}
                                onChange={(evento) => setTitulo(evento.target.value)}
                                placeholder="Ex.: Reunião de planejamento"
                                required
                                maxLength={150}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="responsavel"
                                className="mb-2 block text-sm font-medium"
                            >
                                Responsável
                            </label>

                            <input
                                id="responsavel"
                                type="text"
                                value={responsavel}
                                onChange={(evento) =>
                                    setResponsavel(evento.target.value)
                                }
                                placeholder="Nome do responsável"
                                required
                                maxLength={100}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="participantes"
                                className="mb-2 block text-sm font-medium"
                            >
                                Participantes
                            </label>

                            <input
                                id="participantes"
                                type="number"
                                value={participantes}
                                onChange={(evento) =>
                                    setParticipantes(evento.target.value)
                                }
                                min={1}
                                step={1}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="data"
                                className="mb-2 block text-sm font-medium"
                            >
                                Data
                            </label>

                            <input
                                id="data"
                                type="date"
                                value={data}
                                onChange={(evento) => setData(evento.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="duracao"
                                className="mb-2 block text-sm font-medium"
                            >
                                Duração
                            </label>

                            <select
                                id="duracao"
                                value={duracaoMinutos}
                                onChange={(evento) => {
                                    setDuracaoMinutos(evento.target.value);
                                    setHorarioInicio("");
                                }}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            >
                                <option value="30">30 minutos</option>
                                <option value="60">1 hora</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="horario"
                                className="mb-2 block text-sm font-medium"
                            >
                                Horário de início
                            </label>

                            <select
                                id="horario"
                                value={horarioInicio}
                                onChange={(evento) =>
                                    setHorarioInicio(evento.target.value)
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            >
                                <option value="">Selecione um horário</option>

                                {horariosDisponiveis.map((horario) => (
                                    <option key={horario} value={horario}>
                                        {horario}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={salvando || salas.length === 0}
                                className="w-full rounded-lg bg-slate-900 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {salvando ? "Reservando..." : "Criar reserva"}
                            </button>
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
                            Reservas cadastradas
                        </h2>

                        <span className="text-sm text-slate-500">
                            {reservasFiltradas.length} reserva(s)
                        </span>
                    </div>

                    <div className="mb-5">
                        <label
                            htmlFor="filtro-sala"
                            className="mb-2 block text-sm font-medium"
                        >
                            Filtrar por sala
                        </label>

                        <select
                            id="filtro-sala"
                            value={salaFiltroId}
                            onChange={(evento) =>
                                setSalaFiltroId(evento.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 md:max-w-sm"
                        >
                            <option value="">Todas as salas</option>

                            {salas.map((sala) => (
                                <option key={sala.id} value={sala.id}>
                                    {sala.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {carregando && (
                        <p className="text-slate-600">
                            Carregando reservas...
                        </p>
                    )}

                    {erro && (
                        <p className="rounded-lg bg-red-50 p-3 text-red-700">
                            {erro}
                        </p>
                    )}

                    {!carregando && !erro && reservasFiltradas.length === 0 && (
                        <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
                            {salaFiltroId
                                ? "Nenhuma reserva encontrada para esta sala."
                                : "Nenhuma reserva cadastrada."}
                        </div>
                    )}

                    {!carregando && !erro && reservasFiltradas.length > 0 && (
                        <ul className="space-y-4">
                            {reservasFiltradas.map((reserva) => {
                                const estado = obterEstadoDaReserva(
                                    reserva,
                                    horarioAtual
                                );

                                return (
                                    <li
                                        key={reserva.id}
                                        className="rounded-xl border border-slate-200 p-5"
                                    >
                                        <div className="flex flex-col justify-between gap-4 md:flex-row">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-lg font-semibold">
                                                        {reserva.titulo}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${obterClasseDoEstado(
                                                            estado
                                                        )}`}
                                                    >
                                                        {estado}
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-sm text-slate-600">
                                                    Sala:{" "}
                                                    <strong>
                                                        {reserva.sala?.nome ??
                                                            "Sala não encontrada"}
                                                    </strong>
                                                </p>

                                                <p className="mt-1 text-sm text-slate-600">
                                                    Responsável: {reserva.responsavel}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-600">
                                                    Participantes: {reserva.participantes}
                                                </p>
                                            </div>

                                            <div className="text-sm text-slate-600 md:text-right">
                                                <p>
                                                    <strong>Início:</strong>{" "}
                                                    {formatarData(reserva.inicio)}
                                                </p>

                                                <p className="mt-1">
                                                    <strong>Fim:</strong>{" "}
                                                    {formatarData(reserva.fim)}
                                                </p>

                                                <p className="mt-1">
                                                    Duração: {reserva.duracao_minutos} minutos
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}