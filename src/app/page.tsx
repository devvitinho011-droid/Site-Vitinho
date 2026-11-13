import { FiArrowUpRight, FiChevronDown } from "react-icons/fi";
import { getConfig } from "@/lib/config";
import { ICONS } from "@/lib/icons";

const external = (url: string) => (url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {});

export default async function Home() {
  const { profile, socials, links } = await getConfig();

  return (
    <main>
      {/* Como no barr4k: vídeo de celular até 768px, de PC acima disso; a capa aparece enquanto carrega */}
      {/* 1. Tela inicial: arte em loop, tela cheia. Sem arte cadastrada, a página abre direto nos links. */}
      {profile.heroVideo && (
        <section className="relative h-svh overflow-hidden">
          <video autoPlay loop muted playsInline preload="auto" poster={profile.heroPoster || undefined}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none">
            {profile.heroVideoMobile && <source src={profile.heroVideoMobile} media="(max-width: 768px)" />}
            <source src={profile.heroVideo} />
          </video>
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-[var(--bg)] pointer-events-none" />
          <a href="#links" aria-label="Ver links"
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">Ver meus links</span>
            <FiChevronDown className="w-7 h-7 animate-bounce" />
          </a>
        </section>
      )}

      {/* 2. Links */}
      <section id="links" className="relative min-h-svh flex justify-center px-4 py-8 sm:py-12">
        <div className="page-bg" />
        <div className="w-full max-w-xl flex flex-col items-center animate-rise">
          {profile.banner && (
            <div className="banner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.banner} alt="" />
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatar} alt={profile.name} width={112} height={112}
            className={`avatar relative z-10 ${profile.banner ? "-mt-14" : ""}`} />

          <h1 className="name-tag mt-5 text-center">{profile.name}</h1>
          {profile.handle && <p className="text-sm mt-1 text-[var(--muted)]">{profile.handle}</p>}
          {profile.bio && <p className="text-center text-[15px] mt-3 max-w-xs text-[var(--muted)]">{profile.bio}</p>}

          {socials.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {socials.map((s, i) => {
                const Icon = ICONS[s.icon];
                return (
                  <a key={i} href={s.url} aria-label={s.label} {...external(s.url)} className="social-btn">
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}

          <ul className="w-full max-w-md flex flex-col gap-3 mt-8">
            {links.map((l, i) => {
              const Icon = l.icon ? ICONS[l.icon] : null;
              return (
                <li key={i} className="animate-rise" style={{ animationDelay: `${100 + i * 60}ms` }}>
                  <a href={l.url} {...external(l.url)}
                    className={`link-btn group w-full flex items-center gap-4 px-5 py-4 ${l.highlight ? "is-highlight" : ""}`}>
                    {Icon && <Icon className="w-5 h-5 shrink-0" />}
                    <span className="flex-1 min-w-0 text-left">
                      <span className="block truncate">{l.label}</span>
                      {l.sub && <span className="block text-xs font-normal opacity-70 truncate">{l.sub}</span>}
                    </span>
                    <FiArrowUpRight className="w-5 h-5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              );
            })}
          </ul>

          <footer className="mt-12 text-xs text-[var(--muted)]">© {new Date().getFullYear()} {profile.name}</footer>
        </div>
      </section>
    </main>
  );
}
