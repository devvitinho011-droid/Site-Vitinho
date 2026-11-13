import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isLoggedIn } from "@/lib/auth";
import { CONFIG_TAG, sanitizeConfig, saveConfig } from "@/lib/config";
import { supabaseConfigured } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  if (!(await isLoggedIn())) return NextResponse.json({ error: "Faça login de novo." }, { status: 401 });
  if (!supabaseConfigured()) {
    return NextResponse.json({ error: "Banco não configurado (faltam as chaves do Supabase)." }, { status: 500 });
  }
  const body = await req.json().catch(() => null);
  const config = sanitizeConfig(body);
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
