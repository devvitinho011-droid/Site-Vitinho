# Página de links

Tela inicial com uma arte em loop (tela cheia). Rolando para baixo: foto, nome, redes e botões de link.
O dono edita tudo em **/admin** (senha), e o conteúdo fica salvo no Supabase.

O visual está neutro de propósito: as cores ficam no topo de `src/app/globals.css` (bloco TEMA)
e a fonte em `src/app/layout.tsx`. É aí que entra a identidade dele.

## 1. Banco (Supabase), uma vez só

1. Crie um projeto no Supabase.
2. No **SQL Editor**, rode `supabase/schema.sql` (cria a tabela e a pasta pública `midia` para foto e vídeo).
3. Em **Project Settings > API**, pegue a URL e a `service_role` key.

## 2. Variáveis

Copie `.env.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=senha-do-painel
```

Na Vercel, coloque as mesmas em **Settings > Environment Variables**.

## 3. Rodar

```bash
npm install
npm run dev
```

- Página: http://localhost:3000
- Painel: http://localhost:3000/admin

## Arte da tela inicial

- PC: **1920×1080** (16:9). Celular: **1080×1920** (9:16), opcional.
- O importante fica no centro, porque a imagem é cortada para encher a tela.
- MP4 (H.264), sem som, de 8 a 15 s em loop, até uns 10 MB (no celular, até uns 5 MB).
- Imagem de capa (primeiro quadro em JPG), mostrada enquanto o vídeo carrega.
- Sem vídeo cadastrado, a página abre direto nos links.

## Observações

- Sem o banco configurado, a página mostra o conteúdo padrão de `src/links.ts`.
- Os links só aceitam http(s), mailto e tel (bloqueia link malicioso).
- Trocar `ADMIN_PASSWORD` na Vercel desloga quem estiver logado.
