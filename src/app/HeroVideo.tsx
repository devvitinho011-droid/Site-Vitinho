"use client";

import { useEffect, useRef, useState } from "react";

// Escolhe o vídeo no próprio aparelho: até 768px usa o de celular.
// (O Safari do iPhone ignora <source media="...">, por isso não dá pra deixar o navegador escolher.)
export default function HeroVideo({ desktop, mobile, poster }: { desktop: string; mobile: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const pick = () => {
      const m = mq.matches && !!mobile;
      setIsMobile(mq.matches);
      setSrc(m ? mobile : desktop);
    };
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, [desktop, mobile]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    v.play().catch(() => {});
    // Fora da tela, pausa: decodificar vídeo em tela cheia pesa e deixa a rolagem engasgada no celular
    // Limite de 1%: só encostar na borda da tela (arte acabou de sair) já conta como fora
    const io = new IntersectionObserver(([e]) => {
      if (e.intersectionRatio >= 0.01) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.01 });
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      key={src ?? "none"}
      src={src ?? undefined}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      // A capa é da arte deitada: no celular ela ficaria cortada, então só usa no PC
      poster={!isMobile && poster ? poster : undefined}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />
  );
}
