import { unstable_cache } from "next/cache";
import { defaultConfig, ICON_NAMES, type IconName, type PageConfig } from "@/links";
import { supabaseAdmin, supabaseConfigured } from "@/lib/supabaseAdmin";

export const CONFIG_TAG = "page-config";
const KEY = "page";

// Lê a configuração do banco. O resultado fica em cache até o admin salvar
// (o salvar chama revalidateTag), então a página não consulta o banco a cada visita.
export const getConfig = unstable_cache(
  async (): Promise<PageConfig> => {
    if (!supabaseConfigured()) return defaultConfig;
    try {
      const { data, error } = await supabaseAdmin().from("site_config").select("value").eq("key", KEY).maybeSingle();
      if (error || !data) return defaultConfig;
      return sanitizeConfig(data.value);
    } catch {
      return defaultConfig;
    }
  },
  // Chave inclui o deploy: a cada deploy novo o padrão do código é relido (o salvar do admin usa a tag)
  [CONFIG_TAG, process.env.VERCEL_DEPLOYMENT_ID ?? "local"],
  { tags: [CONFIG_TAG] },
);

export async function saveConfig(config: PageConfig) {
  const { error } = await supabaseAdmin()
    .from("site_config")
    .upsert({ key: KEY, value: config, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

// ---------- validação: só aceita o formato certo e links seguros ----------

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const icon = (v: unknown): IconName | undefined =>
  (ICON_NAMES as readonly string[]).includes(v as string) ? (v as IconName) : undefined;

// Bloqueia javascript: e afins. Aceita http(s), mailto, tel e caminhos do próprio site (/foto.png)
export function safeUrl(v: unknown): string {
  const s = str(v, 1000);
  if (!s) return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
  if (/^[\w-]+(\.[\w-]+)+/.test(s)) return "https://" + s; // "instagram.com/x" vira https://
  return "";
}

// "@vitinho" ou "vitinho" vira o link do perfil na rede escolhida; e-mail solto vira mailto:
const PROFILE_URL: Partial<Record<IconName, (u: string) => string>> = {
  twitch: (u) => `https://www.twitch.tv/${u}`,
  youtube: (u) => `https://www.youtube.com/@${u}`,
  instagram: (u) => `https://www.instagram.com/${u}`,
  x: (u) => `https://x.com/${u}`,
  tiktok: (u) => `https://www.tiktok.com/@${u}`,
  kick: (u) => `https://kick.com/${u}`,
};

export function smartUrl(v: unknown, kind?: IconName): string {
  const s = str(v, 1000);
  if (!s) return "";
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(s)) return "mailto:" + s; // e-mail solto
  if (kind === "whatsapp" && /^[\d\s()+-]{8,}$/.test(s)) return "https://wa.me/" + s.replace(/\D/g, "");
  const handle = s.match(/^@?([\w.]{2,40})$/);
  if (handle && kind && PROFILE_URL[kind] && !handle[1].includes("..") && !/\.(com|br|net|tv|gg|app)$/i.test(handle[1])) {
    return PROFILE_URL[kind]!(handle[1]);
  }
  const safe = safeUrl(s);
  if (safe) return safe;
  // Qualquer outra coisa é aceita como foi digitada, menos esquemas perigosos (javascript:, data: ...)
  return /^\s*[a-z][\w+.-]*:/i.test(s) ? "" : s;
}

// Confere tudo e devolve a lista do que está errado, em português, pra mostrar no painel.
// Itens totalmente vazios (adicionados e não preenchidos) são só ignorados.
// O painel salva qualquer coisa (pedido do dono). Mantido o formato com "problems" pra o painel continuar compatível.
export function validateConfig(raw: unknown): { config: PageConfig; problems: string[] } {
  return { config: sanitizeConfig(raw), problems: [] };
}

export function sanitizeConfig(raw: unknown): PageConfig {
  const r = (raw ?? {}) as Record<string, any>;
  const p = (r.profile ?? {}) as Record<string, any>;
  return {
    profile: {
      name: str(p.name, 60) || defaultConfig.profile.name,
      handle: str(p.handle, 40),
      bio: str(p.bio, 200),
      avatar: safeUrl(p.avatar) || defaultConfig.profile.avatar,
      // Salvo antes de existir o campo = usa o banner padrão; string vazia = sem banner
      banner: p.banner === undefined ? defaultConfig.profile.banner : safeUrl(p.banner),
      heroVideo: safeUrl(p.heroVideo),
      heroVideoMobile: safeUrl(p.heroVideoMobile),
      heroPoster: safeUrl(p.heroPoster),
    },
    socials: (Array.isArray(r.socials) ? r.socials : []).slice(0, 12).flatMap((s: any) => {
      const i = icon(s?.icon);
      const url = smartUrl(s?.url, i);
      return i ? [{ icon: i, url, label: str(s?.label, 40) || i }] : [];
    }),
    links: (Array.isArray(r.links) ? r.links : []).slice(0, 30).flatMap((l: any) => {
      const label = str(l?.label, 80);
      const url = smartUrl(l?.url, icon(l?.icon));
      if (!label && !url) return [];
      return [{ label: label || url, url, icon: icon(l?.icon), sub: str(l?.sub, 80) || undefined, highlight: !!l?.highlight }];
    }),
  };
}
