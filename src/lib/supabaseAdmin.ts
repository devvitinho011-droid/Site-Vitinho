import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente com a service role: ignora o RLS. Só no servidor (rotas /api),
// depois de conferir o login do admin. Criado no primeiro uso para o build
// não depender da chave.
let client: SupabaseClient | null = null;

export function supabaseConfigured() {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.");
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
