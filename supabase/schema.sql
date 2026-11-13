-- ============================================================
--  Página de links — rodar UMA vez no SQL Editor do Supabase.
--  Pode rodar de novo sem problema: não apaga nada.
-- ============================================================

-- 1. Conteúdo da página (perfil, arte, redes e botões) num JSON só
create table if not exists public.site_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- RLS ligado e sem nenhuma política: ninguém de fora lê ou escreve direto.
-- O site acessa pelo servidor com a service role, e só grava depois de checar a senha do admin.
alter table public.site_config enable row level security;

-- 2. Pasta pública para a foto e os vídeos enviados pelo painel
--    (até 50 MB por arquivo, que é o limite do plano gratuito; só imagem e vídeo)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'midia', 'midia', true, 52428800,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Conferência: deve listar a tabela e a pasta
select 'tabela' as tipo, table_name::text as nome from information_schema.tables where table_schema = 'public' and table_name = 'site_config'
union all
select 'pasta', id::text from storage.buckets where id = 'midia';
