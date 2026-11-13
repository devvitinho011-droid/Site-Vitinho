import type { Metadata } from "next";
import { isLoggedIn } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { supabaseConfigured } from "@/lib/supabaseAdmin";
import LoginForm from "./LoginForm";
import Editor from "./Editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Painel", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isLoggedIn())) return <LoginForm />;
  return <Editor initial={await getConfig()} dbReady={supabaseConfigured()} />;
}
