import { NextResponse } from "next/server";
import { checkPassword, startSession } from "@/lib/auth";

export async function POST(req: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD não configurada no servidor." }, { status: 500 });
  }
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!checkPassword(String(password ?? ""))) {
    await new Promise((r) => setTimeout(r, 800)); // freia quem tenta adivinhar
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }
  await startSession();
  return NextResponse.json({ ok: true });
}
