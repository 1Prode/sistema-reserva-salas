import Link from "next/link";

export default function PaginaInicial() {
  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-100 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <section className="mb-10 rounded-2xl bg-slate-900 px-6 py-12 text-white shadow-sm md:px-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Gerenciamento de espaços
          </p>

          <h1 className="max-w-2xl text-3xl font-bold md:text-4xl">
            Sistema de Reserva de Salas
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Cadastre salas, organize reservas e evite conflitos de
            horário em um único lugar.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/reservas"
              className="rounded-lg bg-white px-5 py-3 font-medium text-slate-900 hover:bg-slate-100"
            >
              Gerenciar reservas
            </Link>

            <Link
              href="/salas"
              className="rounded-lg border border-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-800"
            >
              Gerenciar salas
            </Link>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <Link
            href="/salas"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Salas</h2>

            <p className="mt-2 text-slate-600">
              Cadastre salas, defina suas capacidades e mantenha os
              espaços disponíveis organizados.
            </p>

            <p className="mt-5 text-sm font-semibold text-slate-900">
              Acessar salas →
            </p>
          </Link>

          <Link
            href="/reservas"
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-xl font-semibold">Reservas</h2>

            <p className="mt-2 text-slate-600">
              Crie, edite, filtre e acompanhe reservas, com validação de
              capacidade e conflitos.
            </p>

            <p className="mt-5 text-sm font-semibold text-slate-900">
              Acessar reservas →
            </p>
          </Link>
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Regras de funcionamento
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 text-sm text-slate-600 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <strong className="block text-slate-900">
                Horário
              </strong>

              <span>Segunda a sexta, das 08:00 às 21:00.</span>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <strong className="block text-slate-900">
                Duração
              </strong>

              <span>Reservas de 30 minutos ou 1 hora.</span>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <strong className="block text-slate-900">
                Disponibilidade
              </strong>

              <span>Conflitos de horário e excesso de capacidade são bloqueados.</span>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <strong className="block text-slate-900">
                Intervalo
              </strong>

              <span>
                Após o término de cada reserva, a sala permanece indisponível
                por 10 minutos.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}