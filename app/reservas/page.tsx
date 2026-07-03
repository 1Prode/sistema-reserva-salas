"use client";

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

export default function PaginaDeReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [horarioAtual, setHorarioAtual] = useState(new Date());

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
    const intervalo = window.setInterval(() => {
      setHorarioAtual(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalo);
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Reservas</h1>

          <p className="mt-2 text-slate-600">
            Consulte as reservas cadastradas e seus horários.
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Reservas cadastradas
            </h2>

            <span className="text-sm text-slate-500">
              {reservas.length} reserva(s)
            </span>
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

          {!carregando && !erro && reservas.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Nenhuma reserva cadastrada.
            </div>
          )}

          {!carregando && !erro && reservas.length > 0 && (
            <ul className="space-y-4">
              {reservas.map((reserva) => {
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