// Tipos da página e o conteúdo PADRÃO.
// Depois que o banco estiver configurado, quem manda é o painel /admin;
// este arquivo só é usado se o banco estiver vazio ou fora do ar.

export const ICON_NAMES = [
  "twitch", "youtube", "instagram", "x", "tiktok", "discord",
  "whatsapp", "steam", "kick", "spotify", "email", "site", "gift", "shop", "coin", "game", "telegram",
] as const;
export type IconName = (typeof ICON_NAMES)[number];

export type LinkItem = {
  label: string;       // texto do botão
  url: string;         // para onde vai
  icon?: IconName;     // ícone à esquerda (opcional)
  sub?: string;        // linha pequena embaixo do texto (opcional)
  highlight?: boolean; // true = botão de destaque (vermelho)
};

export type Social = { icon: IconName; url: string; label: string };

export type Profile = {
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  banner: string; // arte larga no topo dos links (ideal 1500x500). Vazio = sem banner
  // Arte da tela inicial (vídeo em loop, igual ao barr4k). Sem vídeo, a página abre direto nos links.
  heroVideo: string;       // .mp4 deitado (PC), ideal 1920x1080
  heroVideoMobile: string; // .mp4 em pé (celular), ideal 1080x1920 — opcional
  heroPoster: string;  // imagem mostrada enquanto o vídeo carrega (opcional)
};

export type PageConfig = { profile: Profile; socials: Social[]; links: LinkItem[] };

export const defaultConfig: PageConfig = {
  profile: {
    name: "Vitinho",
    handle: "twitch.tv/vitinho",
    bio: "Live na Twitch. Chega mais!",
    avatar: "/avatar.jpg",
    banner: "/banner.webp",
    heroVideo: "/hero.mp4",
    heroVideoMobile: "/hero-mobile.mp4",
    heroPoster: "/hero-poster.jpg",
  },
  socials: [
    { icon: "twitch", url: "https://www.twitch.tv/vitinho", label: "Twitch" },
  ],
  links: [
    { label: "Assista à live", sub: "twitch.tv/vitinho", url: "https://www.twitch.tv/vitinho", icon: "twitch", highlight: true },
    { label: "Contato comercial", sub: "victorhugo1010v@gmail.com", url: "mailto:victorhugo1010v@gmail.com", icon: "email" },
  ],
};
