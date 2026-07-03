"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { SeletorData } from "@/components/seletor-data";
import {
    obterDataAtualFortaleza,
    obterDataLimiteReserva,
} from "@/lib/reservas/validacoes-temporais";

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
    pode_editar: boolean;
    pode_excluir: boolean;
};

type EstadoDaReserva = "Próxima" | "Em andamento" | "Encerrada";

type FiltroSituacao = "ativas" | "finalizadas";

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
        timeZone: "America/Fortaleza",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(dataIso));
}

function formatarHorario(dataIso: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Fortaleza",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
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

function obterDataEHorarioDaReserva(inicioIso: string) {
    const partes = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Fortaleza",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).formatToParts(new Date(inicioIso));

    const valores = Object.fromEntries(
        partes.map((parte) => [parte.type, parte.value])
    );

    return {
        data: `${valores.year}-${valores.month}-${valores.day}`,
        horario: `${valores.hour}:${valores.minute}`,
    };
}

function obterDataLocalIso(inicioIso: string): string {
    const partes = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Fortaleza",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date(inicioIso));

    const valores = Object.fromEntries(
        partes.map((parte) => [parte.type, parte.value])
    );

    return `${valores.year}-${valores.month}-${valores.day}`;
}

function formatarDataParaExibicao(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split("-");

    return `${dia}/${mes}/${ano}`;
}

export default function PaginaDeReservas() {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [horarioAtual, setHorarioAtual] = useState(new Date());
    const [salas, setSalas] = useState<Sala[]>([]);

    const [salaId, setSalaId] = useState("");
    const [titulo, setTitulo] = useState("");
    const [participantes, setParticipantes] = useState("");
    const [data, setData] = useState("");
    const [horarioInicio, setHorarioInicio] = useState("");
    const [duracaoMinutos, setDuracaoMinutos] = useState("30");

    const [salvando, setSalvando] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [salaFiltroId, setSalaFiltroId] = useState("");
    const [filtroSituacao, setFiltroSituacao] =
        useState<FiltroSituacao>("ativas");
    const [filtroData, setFiltroData] = useState("");

    const [reservaEmEdicaoId, setReservaEmEdicaoId] = useState<
        string | null
    >(null);

    const [reservaSendoExcluidaId, setReservaSendoExcluidaId] =
        useState<string | null>(null);

    const horariosDisponiveis = gerarHorarios(
        Number(duracaoMinutos)
    );

    const dataMinima = obterDataAtualFortaleza();
    const dataMaxima = obterDataLimiteReserva();

    const agora = horarioAtual.getTime();

    const datasDisponiveis = Array.from(
        new Set(reservas.map((reserva) => obterDataLocalIso(reserva.inicio)))
    ).sort();

    const reservasFiltradas = reservas.filter((reserva) => {
        const correspondeSala =
            !salaFiltroId || reserva.sala_id === salaFiltroId;

        const finalizada = new Date(reserva.fim).getTime() <= agora;

        const correspondeSituacao =
            filtroSituacao === "finalizadas" ? finalizada : !finalizada;

        const correspondeData =
            !filtroData || obterDataLocalIso(reserva.inicio) === filtroData;

        return correspondeSala && correspondeSituacao && correspondeData;
    });

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

    async function salvarReserva(
        evento: FormEvent<HTMLFormElement>
    ) {
        evento.preventDefault();

        setSalvando(true);
        setErroFormulario("");
        setMensagem("");

        try {
            const editando = reservaEmEdicaoId !== null;

            const resposta = await fetch(
                editando
                    ? `/api/reservas/${reservaEmEdicaoId}`
                    : "/api/reservas",
                {
                    method: editando ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sala_id: salaId,
                        titulo,
                        participantes: Number(participantes),
                        data,
                        horario_inicio: horarioInicio,
                        duracao_minutos: Number(duracaoMinutos),
                    }),
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ?? "Não foi possível salvar a reserva."
                );
            }

            const salaSelecionada =
                salas.find((sala) => sala.id === salaId) ?? null;

            const reservaSalva: Reserva = {
                ...resultado,
                sala: salaSelecionada,
            };

            if (editando) {
                setReservas((reservasAtuais) =>
                    reservasAtuais
                        .map((reserva) =>
                            reserva.id === reservaSalva.id
                                ? reservaSalva
                                : reserva
                        )
                        .sort(
                            (reservaA, reservaB) =>
                                new Date(reservaA.inicio).getTime() -
                                new Date(reservaB.inicio).getTime()
                        )
                );

                setMensagem("Reserva atualizada com sucesso.");
            } else {
                setReservas((reservasAtuais) =>
                    [...reservasAtuais, reservaSalva].sort(
                        (reservaA, reservaB) =>
                            new Date(reservaA.inicio).getTime() -
                            new Date(reservaB.inicio).getTime()
                    )
                );

                setMensagem("Reserva criada com sucesso.");
            }

            setSalaId("");
            setTitulo("");
            setParticipantes("");
            setData("");
            setHorarioInicio("");
            setDuracaoMinutos("30");
            setReservaEmEdicaoId(null);
        } catch (erro) {
            setErroFormulario(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao salvar a reserva."
            );
        } finally {
            setSalvando(false);
        }
    }

    function iniciarEdicao(reserva: Reserva) {
        if (!reserva.pode_editar) {
            return;
        }

        const valores = obterDataEHorarioDaReserva(reserva.inicio);

        setReservaEmEdicaoId(reserva.id);
        setSalaId(reserva.sala_id);
        setTitulo(reserva.titulo);
        setParticipantes(String(reserva.participantes));
        setData(valores.data);
        setDuracaoMinutos(String(reserva.duracao_minutos));
        setHorarioInicio(valores.horario);

        setErroFormulario("");
        setMensagem("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function cancelarEdicao() {
        setReservaEmEdicaoId(null);
        setSalaId("");
        setTitulo("");
        setParticipantes("");
        setData("");
        setHorarioInicio("");
        setDuracaoMinutos("30");
        setErroFormulario("");
        setMensagem("");
    }

    async function excluirReserva(reserva: Reserva) {
        if (!reserva.pode_excluir) {
            return;
        }

        const confirmou = window.confirm(
            `Deseja realmente excluir a reserva "${reserva.titulo}"?`
        );

        if (!confirmou) {
            return;
        }

        setReservaSendoExcluidaId(reserva.id);
        setErroFormulario("");
        setMensagem("");

        try {
            const resposta = await fetch(`/api/reservas/${reserva.id}`, {
                method: "DELETE",
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.erro ?? "Não foi possível excluir a reserva."
                );
            }

            setReservas((reservasAtuais) =>
                reservasAtuais.filter(
                    (reservaAtual) => reservaAtual.id !== reserva.id
                )
            );

            if (reservaEmEdicaoId === reserva.id) {
                cancelarEdicao();
            }

            setMensagem("Reserva excluída com sucesso.");
        } catch (erro) {
            setErroFormulario(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao excluir a reserva."
            );
        } finally {
            setReservaSendoExcluidaId(null);
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
                        {reservaEmEdicaoId ? "Editar reserva" : "Nova reserva"}
                    </h2>

                    {salas.length === 0 && (
                        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                            É necessário cadastrar pelo menos uma sala antes de criar
                            uma reserva.
                        </p>
                    )}

                    <form
                        onSubmit={salvarReserva}
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

                            <SeletorData
                                id="data"
                                value={data}
                                onChange={setData}
                                min={dataMinima}
                                max={dataMaxima}
                                required
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Reservas podem ser feitas com até 15 dias de antecedência.
                            </p>
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

                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                disabled={salvando || salas.length === 0}
                                className="w-full rounded-lg bg-slate-900 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {salvando
                                    ? "Salvando..."
                                    : reservaEmEdicaoId
                                        ? "Atualizar reserva"
                                        : "Criar reserva"}
                            </button>

                            {reservaEmEdicaoId && (
                                <button
                                    type="button"
                                    onClick={cancelarEdicao}
                                    disabled={salvando}
                                    className="rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50"
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
                            Reservas cadastradas
                        </h2>

                        <span className="text-sm text-slate-500">
                            {reservasFiltradas.length} reserva(s)
                        </span>
                    </div>

                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                        <div>
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
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:w-64"
                            >
                                <option value="">Todas as salas</option>

                                {salas.map((sala) => (
                                    <option key={sala.id} value={sala.id}>
                                        {sala.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="filtro-data"
                                className="mb-2 block text-sm font-medium"
                            >
                                Data
                            </label>

                            <select
                                id="filtro-data"
                                value={filtroData}
                                onChange={(evento) =>
                                    setFiltroData(evento.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 sm:w-64"
                            >
                                <option value="">Todas as datas</option>

                                {datasDisponiveis.map((dataDisponivel) => (
                                    <option key={dataDisponivel} value={dataDisponivel}>
                                        {formatarDataParaExibicao(dataDisponivel)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <span className="mb-2 block text-sm font-medium">
                                Situação
                            </span>

                            <div className="inline-flex rounded-lg border border-slate-300 p-1">
                                <button
                                    type="button"
                                    onClick={() => setFiltroSituacao("ativas")}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        filtroSituacao === "ativas"
                                            ? "bg-slate-900 text-white"
                                            : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    Ativas
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFiltroSituacao("finalizadas")}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        filtroSituacao === "finalizadas"
                                            ? "bg-slate-900 text-white"
                                            : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    Finalizadas
                                </button>
                            </div>
                        </div>
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
                            {filtroSituacao === "finalizadas"
                                ? "Não há reservas finalizadas para os filtros selecionados."
                                : "Não há reservas ativas para os filtros selecionados."}
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
                                                    <strong>Data:</strong>{" "}
                                                    {formatarData(reserva.inicio)}
                                                </p>

                                                <p className="mt-1">
                                                    <strong>Início:</strong>{" "}
                                                    {formatarHorario(reserva.inicio)}
                                                </p>

                                                <p className="mt-1">
                                                    <strong>Fim:</strong>{" "}
                                                    {formatarHorario(reserva.fim)}
                                                </p>

                                                <p className="mt-1">
                                                    Duração: {reserva.duracao_minutos} minutos
                                                </p>

                                                {(reserva.pode_editar || reserva.pode_excluir) && (
                                                    <div className="mt-4 flex gap-2">
                                                        {reserva.pode_editar && (
                                                            <button
                                                                type="button"
                                                                onClick={() => iniciarEdicao(reserva)}
                                                                disabled={reservaSendoExcluidaId === reserva.id}
                                                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                                                            >
                                                                Editar
                                                            </button>
                                                        )}

                                                        {reserva.pode_excluir && (
                                                            <button
                                                                type="button"
                                                                onClick={() => excluirReserva(reserva)}
                                                                disabled={reservaSendoExcluidaId === reserva.id}
                                                                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                            >
                                                                {reservaSendoExcluidaId === reserva.id
                                                                    ? "Excluindo..."
                                                                    : "Excluir"}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
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