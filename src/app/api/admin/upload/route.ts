import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabaseAdmin";

const BUCKET = "midia";
const ALLOWED: Record<string, string[]> = {
  image: ["png", "jpg", "jpeg", "webp", "gif"],
  video: ["mp4", "webm"],
};

// Gera um link assinado para o painel enviar o arquivo direto ao Supabase
// (vídeo grande não passa pelo limite de tamanho das rotas da Vercel).
export async function POST(req: Request) {
  if (!(await isLoggedIn())) return NextResponse.json({ error: "Faça login de novo." }, { status: 401 });
  if (!supabaseConfigured()) return NextResponse.json({ error: "Banco não configurado." }, { status: 500 });

  const { filename, kind } = await req.json().catch(() => ({}));
  const ext = String(filename ?? "").split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED[kind as string]?.includes(ext)) {
    return NextResponse.json({ error: `Formato não aceito (.${ext}).` }, { status: 400 });
  }

  const path = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const storage = supabaseAdmin().storage.from(BUCKET);
  const { data, error } = await storage.createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Falha no upload." }, { status: 500 });

  return NextResponse.json({ signedUrl: data.signedUrl, publicUrl: storage.getPublicUrl(path).data.publicUrl });
}
