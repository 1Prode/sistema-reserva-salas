import { supabaseServidor } from "@/lib/supabase/servidor";
import { obterSessao } from "@/lib/auth/dal";
import {
  dataUltrapassaLimite,
  inicioNoPassadoOuAgora,
  podeEditarReserva,
} from "@/lib/reservas/validacoes-temporais";
import {
  adicionarIntervaloAoFim,
  obterFimDaIndisponibilidade,
  subtrairIntervaloDoInicio,
} from "@/lib/reservas/intervalo-reservas";

type ContextoDaRota = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  contexto: ContextoDaRota
) {
  const { id } = await contexto.params;

  const sessao = await obterSessao();

  const { data: reserva, error } = await supabaseServidor
    .from("reservas")
    .select(`
      id,
      sala_id,
      titulo,
      responsavel,
      participantes,
      inicio,
      fim,
      duracao_minutos,
      criada_em,
      usuario_id,
      sala:salas (
        id,
        nome,
        capacidade
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar reserva:", error);

    return Response.json(
      { erro: "Não foi possível buscar a reserva." },
      { status: 500 }
    );
  }

  if (!reserva) {
    return Response.json(
      { erro: "Reserva não encontrada." },
      { status: 404 }
    );
  }

  const { usuario_id, ...reservaSemUsuarioId } = reserva;

  const temPermissao =
    usuario_id === sessao?.id || sessao?.papel === "admin";

  const ehProprietario = sessao !== null && usuario_id === sessao.id;

  const fimExibicao = ehProprietario
    ? reserva.fim
    : adicionarIntervaloAoFim(new Date(reserva.fim)).toISOString();

  return Response.json({
    ...reservaSemUsuarioId,
    fim_exibicao: fimExibicao,
    pode_editar:
      temPermissao && podeEditarReserva(new Date(reserva.inicio)),
    pode_excluir: temPermissao,
  });
}

type CorpoDaReserva = {
  sala_id?: unknown;
  titulo?: unknown;
  participantes?: unknown;
  data?: unknown;
  horario_inicio?: unknown;
  duracao_minutos?: unknown;
};

export async function PUT(
  request: Request,
  contexto: ContextoDaRota
) {
  const { id } = await contexto.params;

  const sessao = await obterSessao();

  if (!sessao) {
    return Response.json(
      { erro: "É necessário entrar para editar uma reserva." },
      { status: 401 }
    );
  }

  const { data: reservaExistente, error: erroBuscaReserva } =
    await supabaseServidor
      .from("reservas")
      .select("id, usuario_id, inicio")
      .eq("id", id)
      .maybeSingle();

  if (erroBuscaReserva) {
    console.error("Erro ao buscar reserva:", erroBuscaReserva);

    return Response.json(
      { erro: "Não foi possível consultar a reserva." },
      { status: 500 }
    );
  }

  if (!reservaExistente) {
    return Response.json(
      { erro: "Reserva não encontrada." },
      { status: 404 }
    );
  }

  const podeEditar =
    reservaExistente.usuario_id === sessao.id ||
    sessao.papel === "admin";

  if (!podeEditar) {
    return Response.json(
      { erro: "Você não possui permissão para editar esta reserva." },
      { status: 403 }
    );
  }

  if (!podeEditarReserva(new Date(reservaExistente.inicio))) {
    return Response.json(
      {
        erro: "Reservas em andamento ou encerradas não podem ser editadas.",
      },
      { status: 409 }
    );
  }

  let corpo: CorpoDaReserva;

  try {
    corpo = await request.json();
  } catch {
    return Response.json(
      { erro: "O corpo da requisição deve ser um JSON válido." },
      { status: 400 }
    );
  }

  const salaId =
    typeof corpo.sala_id === "string"
      ? corpo.sala_id.trim()
      : "";

  const titulo =
    typeof corpo.titulo === "string"
      ? corpo.titulo.trim()
      : "";

  const data =
    typeof corpo.data === "string"
      ? corpo.data
      : "";

  const horarioInicio =
    typeof corpo.horario_inicio === "string"
      ? corpo.horario_inicio
      : "";

  const participantes = Number(corpo.participantes);
  const duracaoMinutos = Number(corpo.duracao_minutos);

  if (!salaId || !titulo || !data || !horarioInicio) {
    return Response.json(
      { erro: "Todos os campos são obrigatórios." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(participantes) || participantes <= 0) {
    return Response.json(
      {
        erro: "A quantidade de participantes deve ser maior que zero.",
      },
      { status: 400 }
    );
  }

  if (![30, 60].includes(duracaoMinutos)) {
    return Response.json(
      { erro: "A duração deve ser de 30 ou 60 minutos." },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return Response.json(
      { erro: "A data deve estar no formato AAAA-MM-DD." },
      { status: 400 }
    );
  }

  if (!/^\d{2}:\d{2}$/.test(horarioInicio)) {
    return Response.json(
      { erro: "O horário deve estar no formato HH:MM." },
      { status: 400 }
    );
  }

  const [ano, mes, dia] = data.split("-").map(Number);

  const dataDaReserva = new Date(
    Date.UTC(ano, mes - 1, dia, 12)
  );

  const dataValida =
    dataDaReserva.getUTCFullYear() === ano &&
    dataDaReserva.getUTCMonth() === mes - 1 &&
    dataDaReserva.getUTCDate() === dia;

  if (!dataValida) {
    return Response.json(
      { erro: "A data informada é inválida." },
      { status: 400 }
    );
  }

  const diaDaSemana = dataDaReserva.getUTCDay();

  if (diaDaSemana === 0 || diaDaSemana === 6) {
    return Response.json(
      {
        erro: "Reservas são permitidas apenas de segunda a sexta-feira.",
      },
      { status: 400 }
    );
  }

  const [hora, minuto] = horarioInicio
    .split(":")
    .map(Number);

  if (
    !Number.isInteger(hora) ||
    !Number.isInteger(minuto) ||
    hora < 0 ||
    hora > 23 ||
    minuto < 0 ||
    minuto > 59
  ) {
    return Response.json(
      { erro: "O horário informado é inválido." },
      { status: 400 }
    );
  }

  if (minuto % 10 !== 0) {
    return Response.json(
      {
        erro: "O horário deve começar em intervalos de 10 minutos.",
      },
      { status: 400 }
    );
  }

  const inicioEmMinutos = hora * 60 + minuto;
  const fimEmMinutos = inicioEmMinutos + duracaoMinutos;

  if (
    inicioEmMinutos < 8 * 60 ||
    fimEmMinutos > 21 * 60
  ) {
    return Response.json(
      {
        erro: "A reserva deve ocorrer entre 08:00 e 21:00.",
      },
      { status: 400 }
    );
  }

  const { data: sala, error: erroSala } =
    await supabaseServidor
      .from("salas")
      .select("id, capacidade")
      .eq("id", salaId)
      .maybeSingle();

  if (erroSala) {
    console.error("Erro ao consultar sala:", erroSala);

    return Response.json(
      { erro: "Não foi possível consultar a sala." },
      { status: 500 }
    );
  }

  if (!sala) {
    return Response.json(
      { erro: "Sala não encontrada." },
      { status: 404 }
    );
  }

  if (participantes > sala.capacidade) {
    return Response.json(
      {
        erro: `A sala comporta no máximo ${sala.capacidade} participantes.`,
      },
      { status: 400 }
    );
  }

  const inicio = new Date(
    `${data}T${horarioInicio}:00-03:00`
  );

  const agora = new Date();

  if (inicioNoPassadoOuAgora(inicio, agora)) {
    return Response.json(
      {
        erro: "Não é possível alterar a reserva para uma data ou horário passado.",
      },
      { status: 400 }
    );
  }

  if (dataUltrapassaLimite(data, agora)) {
    return Response.json(
      {
        erro: "As reservas podem ser realizadas com no máximo 15 dias de antecedência.",
      },
      { status: 400 }
    );
  }

  const fim = new Date(
    inicio.getTime() + duracaoMinutos * 60 * 1000
  );

  const inicioIso = inicio.toISOString();
  const fimIso = fim.toISOString();

  const inicioDaBusca = subtrairIntervaloDoInicio(inicio);
  const fimDaBusca = obterFimDaIndisponibilidade(fim);

  const { data: conflitos, error: erroConflito } =
    await supabaseServidor
      .from("reservas")
      .select("id, inicio, fim")
      .eq("sala_id", salaId)
      .neq("id", id)
      .lt("inicio", fimDaBusca.toISOString())
      .gt("fim", inicioDaBusca.toISOString())
      .limit(1);

  if (erroConflito) {
    console.error(
      "Erro ao verificar conflito:",
      erroConflito
    );

    return Response.json(
      {
        erro: "Não foi possível verificar a disponibilidade.",
      },
      { status: 500 }
    );
  }

  if (conflitos && conflitos.length > 0) {
    return Response.json(
      {
        erro: "A sala já possui uma reserva nesse período.",
      },
      { status: 409 }
    );
  }

  const { data: reservaAtualizada, error: erroAtualizacao } =
    await supabaseServidor
      .from("reservas")
      .update({
        sala_id: salaId,
        titulo,
        participantes,
        inicio: inicioIso,
        fim: fimIso,
        duracao_minutos: duracaoMinutos,
      })
      .eq("id", id)
      .select(`
        id,
        sala_id,
        titulo,
        responsavel,
        participantes,
        inicio,
        fim,
        duracao_minutos,
        criada_em
      `)
      .maybeSingle();

  if (erroAtualizacao) {
    console.error(
      "Erro ao atualizar reserva:",
      erroAtualizacao
    );

    return Response.json(
      { erro: "Não foi possível atualizar a reserva." },
      { status: 500 }
    );
  }

  if (!reservaAtualizada) {
    return Response.json(
      { erro: "Reserva não encontrada." },
      { status: 404 }
    );
  }

  const ehProprietario = reservaExistente.usuario_id === sessao.id;

  const fimExibicao = ehProprietario
    ? reservaAtualizada.fim
    : adicionarIntervaloAoFim(new Date(reservaAtualizada.fim)).toISOString();

  return Response.json({
    ...reservaAtualizada,
    fim_exibicao: fimExibicao,
    pode_editar: true,
    pode_excluir: true,
  });
}

export async function DELETE(
  _request: Request,
  contexto: ContextoDaRota
) {
  const { id } = await contexto.params;

  const sessao = await obterSessao();

  if (!sessao) {
    return Response.json(
      { erro: "É necessário entrar para excluir uma reserva." },
      { status: 401 }
    );
  }

  const { data: reservaExistente, error: erroBuscaReserva } =
    await supabaseServidor
      .from("reservas")
      .select("id, usuario_id")
      .eq("id", id)
      .maybeSingle();

  if (erroBuscaReserva) {
    console.error("Erro ao buscar reserva:", erroBuscaReserva);

    return Response.json(
      { erro: "Não foi possível consultar a reserva." },
      { status: 500 }
    );
  }

  if (!reservaExistente) {
    return Response.json(
      { erro: "Reserva não encontrada." },
      { status: 404 }
    );
  }

  const podeExcluir =
    reservaExistente.usuario_id === sessao.id ||
    sessao.papel === "admin";

  if (!podeExcluir) {
    return Response.json(
      { erro: "Você não possui permissão para excluir esta reserva." },
      { status: 403 }
    );
  }

  const { data, error } = await supabaseServidor
    .from("reservas")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erro ao excluir reserva:", error);

    return Response.json(
      { erro: "Não foi possível excluir a reserva." },
      { status: 500 }
    );
  }

  if (!data) {
    return Response.json(
      { erro: "Reserva não encontrada." },
      { status: 404 }
    );
  }

  return Response.json({
    mensagem: "Reserva excluída com sucesso.",
  });
}