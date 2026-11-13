"use client";

import { useEffect } from "react";

// Depois de alguns segundos na arte da tela inicial, desce sozinho até os links.
// Se a pessoa já mexeu (rolou, tocou, apertou tecla) ou já está fora do topo, não faz nada.
export default function AutoScroll({ target, delay = 5000 }: { target: string; delay?: number }) {
  useEffect(() => {
    // Abriu direto em #links (ou outra âncora): respeita
    if (window.location.hash) return;

    let cancelled = false;
    const cancel = () => { cancelled = true; };
    const events = ["wheel", "touchstart", "keydown", "mousedown"] as const;
    events.forEach((e) => window.addEventListener(e, cancel, { passive: true, once: true }));

    const timer = window.setTimeout(() => {
      if (cancelled || window.scrollY > 50) return;
      const el = document.getElementById(target);
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, delay);

    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, cancel));
    };
  }, [target, delay]);

  return null;
}
