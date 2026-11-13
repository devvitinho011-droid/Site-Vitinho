// Tipos da página e o conteúdo PADRÃO.
// Depois que o banco estiver configurado, quem manda é o painel /admin;
// este arquivo só é usado se o banco estiver vazio ou fora do ar.

export const ICON_NAMES = [
  "twitch", "youtube", "instagram", "x", "tiktok", "discord",
  "whatsapp", "steam", "kick", "spotify", "email", "site", "gift", "shop",
] as const;
export type IconName = (typeof ICON_NAMES)[number];

export type LinkItem = {
  label: string;       // texto do botão
  url: string;         // para onde vai
  icon?: IconName;     // ícone à esquerda (opcional)
  sub?: string;        // linha pequena embaixo do texto (opcional)
  highlight?: boolean; // true = botão roxo com anel RGB
};

export type Social = { icon: IconName; url: string; label: string };

export type Profile = {
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  // Arte da tela inicial (vídeo em loop, igual ao barr4k). Sem vídeo, a página abre direto nos links.
  heroVideo: string;       // .mp4 deitado (PC), ideal 1920x1080
  heroVideoMobile: string; // .mp4 em pé (celular), ideal 1080x1920 — opcional
  heroPoster: string;  // imagem mostrada enquanto o vídeo carrega (opcional)
};

export type PageConfig = { profile: Profile; socials: Social[]; links: LinkItem[] };

export const defaultConfig: PageConfig = {
  profile: {
    name: "SEU NOME",
    handle: "@seuuser",
    bio: "Uma frase curta sobre você ou o canal.",
    avatar: "/avatar.svg",
    heroVideo: "",
    heroVideoMobile: "",
    heroPoster: "",
  },
  socials: [
    { icon: "twitch", url: "https://twitch.tv/", label: "Twitch" },
    { icon: "youtube", url: "https://youtube.com/", label: "YouTube" },
    { icon: "instagram", url: "https://instagram.com/", label: "Instagram" },
    { icon: "x", url: "https://x.com/", label: "X" },
    { icon: "tiktok", url: "https://tiktok.com/", label: "TikTok" },
  ],
  links: [
    { label: "Assista à live", sub: "Ao vivo toda semana", url: "https://twitch.tv/", icon: "twitch", highlight: true },
    { label: "Últimos vídeos", url: "https://youtube.com/", icon: "youtube" },
    { label: "Comunidade no Discord", url: "https://discord.gg/", icon: "discord" },
    { label: "Loja / Parceiros", url: "https://", icon: "shop" },
    { label: "Contato comercial", url: "mailto:contato@exemplo.com", icon: "email" },
  ],
};
