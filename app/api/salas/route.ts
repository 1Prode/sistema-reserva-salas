import { supabaseServidor } from "@/lib/supabase/servidor";

export async function GET() {
  const { data, error } = await supabaseServidor
    .from("salas")
    .select("id, nome, capacidade, criada_em")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar salas:", error);

    return Response.json(
      {
        erro: "Não foi possível buscar as salas.",
      },
      {
        status: 500,
      }
    );
  }

  return Response.json(data);
}

export async function POST(request: Request) {
  const corpo = await request.json();

  const nome = corpo.nome?.trim();
  const capacidade = Number(corpo.capacidade);

  if (!nome) {
    return Response.json(
      { erro: "O nome da sala é obrigatório." },
      { status: 400 }
    );
  }

  if (!Number.isInteger(capacidade) || capacidade <= 0) {
    return Response.json(
      { erro: "A capacidade deve ser um número inteiro maior que zero." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServidor
    .from("salas")
    .insert({
      nome,
      capacidade,
    })
    .select("id, nome, capacidade, criada_em")
    .single();

  if (error) {
    console.error("Erro ao criar sala:", error);

    if (error.code === "23505") {
      return Response.json(
        { erro: "Já existe uma sala com esse nome." },
        { status: 409 }
      );
    }

    return Response.json(
      { erro: "Não foi possível criar a sala." },
      { status: 500 }
    );
  }

  return Response.json(data, { status: 201 });
}