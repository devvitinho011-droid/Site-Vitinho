"use client";

import { useEffect } from "react";

// Ao entrar: a pessoa fica presa na arte da tela inicial (não rola) por alguns segundos.
// Passado o tempo, a página desce sozinha até os links e a rolagem fica liberada de vez.
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "End", "Home"]);

export default function AutoScroll({ target, delay = 5000, duration = 1600 }: { target: string; delay?: number; duration?: number }) {
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

    let frame = 0;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(target);
      if (!el) return unlock();
      const end = el.getBoundingClientRect().top + window.scrollY;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        window.scrollTo({ top: end, behavior: "instant" });
        return unlock();
      }
      // Descida própria (o "smooth" do navegador é rápido demais): dura `duration` ms,
      // começa e termina devagar. A rolagem só é liberada quando chega nos links.
      const start = window.scrollY;
      const t0 = performance.now();
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        // "instant": o <html> tem scroll-smooth, que atrapalharia cada passo
        window.scrollTo({ top: start + (end - start) * ease(t), behavior: "instant" });
        if (t < 1) frame = requestAnimationFrame(step);
        else unlock();
      };
      frame = requestAnimationFrame(step);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      unlock();
    };
  }, [target, delay, duration]);

  return null;
}
