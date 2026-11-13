import type { IconType } from "react-icons";
import { FaTwitch, FaYoutube, FaInstagram, FaTiktok, FaDiscord, FaWhatsapp, FaSteam, FaSpotify } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiKick } from "react-icons/si";
import { FiMail, FiGlobe, FiGift, FiShoppingBag } from "react-icons/fi";
import type { IconName } from "@/links";

export const ICONS: Record<IconName, IconType> = {
  twitch: FaTwitch, youtube: FaYoutube, instagram: FaInstagram, x: FaXTwitter, tiktok: FaTiktok,
  discord: FaDiscord, whatsapp: FaWhatsapp, steam: FaSteam, kick: SiKick, spotify: FaSpotify,
  email: FiMail, site: FiGlobe, gift: FiGift, shop: FiShoppingBag,
};

export const ICON_LABELS: Record<IconName, string> = {
  twitch: "Twitch", youtube: "YouTube", instagram: "Instagram", x: "X / Twitter", tiktok: "TikTok",
  discord: "Discord", whatsapp: "WhatsApp", steam: "Steam", kick: "Kick", spotify: "Spotify",
  email: "E-mail", site: "Site", gift: "Presente", shop: "Loja",
};
