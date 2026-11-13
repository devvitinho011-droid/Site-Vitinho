"use client";

import { useEffect } from "react";

// Ao entrar: a pessoa fica presa na arte da tela inicial (não rola) por alguns segundos.
// Passado o tempo, a página desce sozinha até os links e a rolagem fica liberada de vez.
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "End", "Home"]);

export default function AutoScroll({ target, delay = 5000 }: { target: string; delay?: number }) {
  useEffect(() => {
    // Sempre começa no topo (o navegador costuma voltar pra posição antiga ao recarregar)
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const html = document.documentElement;
    const body = document.body;
    const prev = { html: html.style.overflow, body: body.style.overflow, touch: body.style.touchAction };
    const block = (e: Event) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => { if (SCROLL_KEYS.has(e.key)) e.preventDefault(); };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);

    let locked = true;
    const unlock = () => {
      if (!locked) return;
      locked = false;
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
      body.style.touchAction = prev.touch;
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
    };

    const timer = window.setTimeout(() => {
      unlock();
      const el = document.getElementById(target);
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // "instant" e não "auto": o <html> tem scroll-smooth, então "auto" também deslizaria
      el.scrollIntoView({ behavior: reduce ? "instant" : "smooth", block: "start" });
    }, delay);

    return () => {
      window.clearTimeout(timer);
      unlock();
    };
  }, [target, delay]);

  return null;
}
