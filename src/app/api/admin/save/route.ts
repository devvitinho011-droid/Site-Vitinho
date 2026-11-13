import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { CONFIG_TAG, saveConfig, validateConfig } from "@/lib/config";
import { supabaseConfigured } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) return NextResponse.json({ error: "Faça login de novo." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const { config, problems } = validateConfig(body);
  // Não salva pela metade: se algo está errado, avisa e o painel mantém o que foi digitado
  if (problems.length) {
    return NextResponse.json({ error: "Nada foi salvo. Corrija:", problems }, { status: 400 });
  }
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Banco não configurado (faltam as chaves do Supabase)." }, { status: 500 });
  }
  try {
    await saveConfig(config);
  } catch (e) {
    return NextResponse.json({ error: "Erro ao salvar: " + (e as Error).message }, { status: 500 });
  }
  // A página pública passa a mostrar o novo conteúdo na hora
  revalidateTag(CONFIG_TAG, { expire: 0 });
  revalidatePath("/");
  return NextResponse.json({ ok: true, config });
}
