import { supabaseServidor } from "@/lib/supabase/servidor";

type ContextoDaRota = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  contexto: ContextoDaRota
) {
  const { id } = await contexto.params;

  let corpo;

  try {
    corpo = await request.json();
  } catch {
    return Response.json(
      { erro: "O corpo da requisição deve ser um JSON válido." },
      { status: 400 }
    );
  }

  const nome =
    typeof corpo.nome === "string"
      ? corpo.nome.trim()
      : "";

  const capacidade = Number(corpo.capacidade);

  if (!nome) {
    return Response.json(
      { erro: "O nome da sala é obrigatório." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(capacidade) || capacidade <= 0) {
    return Response.json(
      {
        erro: "A capacidade deve ser um número inteiro maior que zero.",
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServidor
    .from("salas")
    .update({
      nome,
      capacidade,
    })
    .eq("id", id)
    .select("id, nome, capacidade, criada_em");

  if (error) {
    console.error("Erro ao atualizar sala:", error);

    if (error.code === "23505") {
      return Response.json(
        { erro: "Já existe uma sala com esse nome." },
        { status: 409 }
      );
    }

    return Response.json(
      { erro: "Não foi possível atualizar a sala." },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return Response.json(
      { erro: "Sala não encontrada." },
      { status: 404 }
    );
  }

  return Response.json(data[0]);
}

export async function DELETE(
  _request: Request,
  contexto: ContextoDaRota
) {
  const { id } = await contexto.params;

  const { data, error } = await supabaseServidor
    .from("salas")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("Erro ao excluir sala:", error);

    if (error.code === "23503") {
      return Response.json(
        {
          erro: "A sala não pode ser excluída porque possui reservas.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      { erro: "Não foi possível excluir a sala." },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return Response.json(
      { erro: "Sala não encontrada." },
      { status: 404 }
    );
  }

  return Response.json({
    mensagem: "Sala excluída com sucesso.",
  });
}