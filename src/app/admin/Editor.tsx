"use client";

import { useState } from "react";
import { FiArrowUp, FiArrowDown, FiTrash2, FiPlus, FiUpload, FiExternalLink, FiLogOut, FiCheck } from "react-icons/fi";
import { ICON_NAMES, type IconName, type LinkItem, type PageConfig, type Social } from "@/links";
import { ICON_LABELS } from "@/lib/icons";

type Kind = "image" | "video";

async function uploadFile(file: File, kind: Kind): Promise<string> {
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, kind }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Falha ao preparar o upload.");
  const put = await fetch(json.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream", "x-upsert": "true" },
    body: file,
  });
  if (!put.ok) throw new Error("Falha ao enviar o arquivo (" + put.status + "). Arquivo grande demais?");
  return json.publicUrl as string;
}

function move<T>(list: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export default function Editor({ initial, dbReady }: { initial: PageConfig; dbReady: boolean }) {
  const [cfg, setCfg] = useState<PageConfig>(initial);
  const [status, setStatus] = useState<{ type: "ok" | "err" | "busy"; msg: string } | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  const setProfile = (patch: Partial<PageConfig["profile"]>) => setCfg((c) => ({ ...c, profile: { ...c.profile, ...patch } }));
  const setLinks = (links: LinkItem[]) => setCfg((c) => ({ ...c, links }));
  const setSocials = (socials: Social[]) => setCfg((c) => ({ ...c, socials }));
  const editLink = (i: number, patch: Partial<LinkItem>) => setLinks(cfg.links.map((l, k) => (k === i ? { ...l, ...patch } : l)));
  const editSocial = (i: number, patch: Partial<Social>) => setSocials(cfg.socials.map((s, k) => (k === i ? { ...s, ...patch } : s)));

  const pick = (field: "avatar" | "banner" | "heroVideo" | "heroVideoMobile" | "heroPoster", kind: Kind) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(field);
    try {
      setProfile({ [field]: await uploadFile(file, kind) });
      setStatus({ type: "ok", msg: "Arquivo enviado. Clique em Salvar para publicar." });
    } catch (err) {
      setStatus({ type: "err", msg: (err as Error).message });
    }
    setUploading(null);
  };

  const save = async () => {
    setStatus({ type: "busy", msg: "Salvando..." });
    const res = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) return window.location.reload();
    setProblems(Array.isArray(json.problems) ? json.problems : []);
    if (!res.ok) return setStatus({ type: "err", msg: json.error || "Erro ao salvar." });
    setCfg(json.config);
    setStatus({ type: "ok", msg: "Salvo! A página já está atualizada." });
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  const UploadBtn = ({ field, kind, label }: { field: "avatar" | "banner" | "heroVideo" | "heroVideoMobile" | "heroPoster"; kind: Kind; label: string }) => (
    <label className="btn-ghost cursor-pointer shrink-0">
      <FiUpload /> {uploading === field ? "Enviando..." : label}
      <input type="file" hidden accept={kind === "image" ? "image/*" : "video/mp4,video/webm"} onChange={pick(field, kind)} disabled={!!uploading || !dbReady} />
    </label>
  );

  return (
    <main className="min-h-svh px-4 py-8 pb-32 flex justify-center">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold">Painel</h1>
          <div className="flex gap-2">
            <a href="/" target="_blank" className="btn-ghost"><FiExternalLink /> Ver página</a>
            <button onClick={logout} className="btn-ghost" aria-label="Sair"><FiLogOut /></button>
          </div>
        </header>

        {!dbReady && (
          <p className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-200 text-sm p-4">
            O banco ainda não está configurado. Coloque as chaves do Supabase nas variáveis de ambiente para poder salvar.
          </p>
        )}

        {/* Arte da tela inicial */}
        <section className="panel">
          <h2 className="panel-title">Arte da tela inicial</h2>
          <p className="hint">Vídeo em loop, tela cheia, sem som, antes dos links. PC 1920x1080 e celular 1080x1920 (deixe o importante no centro). Vazio = abre direto nos links.</p>
          {cfg.profile.heroVideo && (
            <video src={cfg.profile.heroVideo} muted loop autoPlay playsInline className="w-full aspect-video object-cover rounded-xl border border-white/10" />
          )}
          <div className="flex gap-2">
            <input className="field" placeholder="Vídeo PC (1920x1080) .mp4" value={cfg.profile.heroVideo} onChange={(e) => setProfile({ heroVideo: e.target.value })} />
            <UploadBtn field="heroVideo" kind="video" label="PC" />
          </div>
          <div className="flex gap-2">
            <input className="field" placeholder="Vídeo celular (1080x1920) .mp4 — opcional" value={cfg.profile.heroVideoMobile} onChange={(e) => setProfile({ heroVideoMobile: e.target.value })} />
            <UploadBtn field="heroVideoMobile" kind="video" label="Celular" />
          </div>
          <div className="flex gap-2">
            <input className="field" placeholder="Imagem de capa enquanto carrega (opcional)" value={cfg.profile.heroPoster} onChange={(e) => setProfile({ heroPoster: e.target.value })} />
            <UploadBtn field="heroPoster" kind="image" label="Capa" />
          </div>
          {cfg.profile.heroVideo && (
            <button className="text-sm text-red-300 self-start" onClick={() => setProfile({ heroVideo: "", heroVideoMobile: "", heroPoster: "" })}>Remover arte</button>
          )}
        </section>

        {/* Perfil */}
        <section className="panel">
          <h2 className="panel-title">Perfil</h2>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cfg.profile.avatar} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-[var(--border)] bg-neutral-900 shrink-0" />
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              <UploadBtn field="avatar" kind="image" label="Trocar foto" />
              <input className="field text-xs" placeholder="ou link da imagem" value={cfg.profile.avatar} onChange={(e) => setProfile({ avatar: e.target.value })} />
            </div>
          </div>
          <label className="lbl">Banner (arte larga no topo, ideal 1500x500)</label>
          {cfg.profile.banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cfg.profile.banner} alt="" className="w-full aspect-[3/1] object-cover rounded-xl border border-white/10" />
          )}
          <div className="flex gap-2">
            <input className="field" placeholder="Link da imagem do banner (vazio = sem banner)" value={cfg.profile.banner} onChange={(e) => setProfile({ banner: e.target.value })} />
            <UploadBtn field="banner" kind="image" label="Banner" />
          </div>
          <label className="lbl">Nome<input className="field" value={cfg.profile.name} onChange={(e) => setProfile({ name: e.target.value })} /></label>
          <label className="lbl">@<input className="field" value={cfg.profile.handle} onChange={(e) => setProfile({ handle: e.target.value })} /></label>
          <label className="lbl">Bio<textarea className="field min-h-20" value={cfg.profile.bio} onChange={(e) => setProfile({ bio: e.target.value })} /></label>
        </section>

        {/* Redes */}
        <section className="panel">
          <h2 className="panel-title">Redes (ícones redondos)</h2>
          {cfg.socials.map((s, i) => (
            <div key={i} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <select className="field flex-1 sm:flex-none sm:w-40" value={s.icon} onChange={(e) => editSocial(i, { icon: e.target.value as IconName, label: ICON_LABELS[e.target.value as IconName] })}>
                {ICON_NAMES.map((n) => <option key={n} value={n}>{ICON_LABELS[n]}</option>)}
              </select>
              <input className="field order-last sm:order-none basis-full sm:basis-auto sm:flex-1" placeholder="https://... ou @usuario" value={s.url} onChange={(e) => editSocial(i, { url: e.target.value })} />
              <RowActions onUp={() => setSocials(move(cfg.socials, i, -1))} onDown={() => setSocials(move(cfg.socials, i, 1))} onDelete={() => setSocials(cfg.socials.filter((_, k) => k !== i))} />
            </div>
          ))}
          <button className="btn-ghost self-start" onClick={() => setSocials([...cfg.socials, { icon: "instagram", label: "Instagram", url: "" }])}><FiPlus /> Adicionar rede</button>
        </section>

        {/* Botões */}
        <section className="panel">
          <h2 className="panel-title">Botões</h2>
          {cfg.links.map((l, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-black/40 p-3 flex flex-col gap-2">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <select className="field flex-1 sm:flex-none sm:w-40" value={l.icon ?? ""} onChange={(e) => editLink(i, { icon: (e.target.value || undefined) as IconName | undefined })}>
                  <option value="">Sem ícone</option>
                  {ICON_NAMES.map((n) => <option key={n} value={n}>{ICON_LABELS[n]}</option>)}
                </select>
                <input className="field font-bold order-last sm:order-none basis-full sm:basis-auto sm:flex-1" placeholder="Texto do botão" value={l.label} onChange={(e) => editLink(i, { label: e.target.value })} />
                <RowActions onUp={() => setLinks(move(cfg.links, i, -1))} onDown={() => setLinks(move(cfg.links, i, 1))} onDelete={() => setLinks(cfg.links.filter((_, k) => k !== i))} />
              </div>
              <input className="field" placeholder="Link (https://...)" value={l.url} onChange={(e) => editLink(i, { url: e.target.value })} />
              <input className="field text-sm" placeholder="Texto pequeno embaixo (opcional)" value={l.sub ?? ""} onChange={(e) => editLink(i, { sub: e.target.value })} />
              <label className="flex items-center gap-2 text-sm text-gray-300 select-none">
                <input type="checkbox" className="accent-[var(--accent)] w-4 h-4" checked={!!l.highlight} onChange={(e) => editLink(i, { highlight: e.target.checked })} />
                Destaque (botão vermelho pulsando)
              </label>
            </div>
          ))}
          <button className="btn-ghost self-start" onClick={() => setLinks([...cfg.links, { label: "", url: "" }])}><FiPlus /> Adicionar botão</button>
        </section>
      </div>

      {/* Barra de salvar fixa embaixo */}
      <div className="fixed bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center">
        <div className="w-full max-w-2xl flex flex-col gap-2">
          {problems.length > 0 && (
            <ul className="rounded-xl border border-red-500/40 bg-red-950/80 text-red-200 text-sm p-3 list-disc pl-6 max-h-40 overflow-auto">
              {problems.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          )}
          <div className="flex items-center gap-3">
          <p className={`flex-1 text-sm truncate ${status?.type === "err" ? "text-red-400" : status?.type === "ok" ? "text-green-400" : "text-gray-400"}`}>
            {status?.type === "ok" && <FiCheck className="inline mr-1" />}{status?.msg}
          </p>
          <button onClick={save} disabled={status?.type === "busy" || !!uploading || !dbReady} className="btn-primary px-8 py-3">Salvar</button>
          </div>
        </div>
      </div>
    </main>
  );
}

function RowActions({ onUp, onDown, onDelete }: { onUp: () => void; onDown: () => void; onDelete: () => void }) {
  return (
    <div className="flex shrink-0">
      <button className="icon-btn" onClick={onUp} aria-label="Subir"><FiArrowUp /></button>
      <button className="icon-btn" onClick={onDown} aria-label="Descer"><FiArrowDown /></button>
      <button className="icon-btn hover:!text-red-400" onClick={onDelete} aria-label="Remover"><FiTrash2 /></button>
    </div>
  );
}
