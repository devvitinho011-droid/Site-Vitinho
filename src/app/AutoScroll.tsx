"use client";

import { useEffect } from "react";

// Ao entrar: a pessoa fica presa na arte da tela inicial (não rola) por alguns segundos.
// Passado o tempo, a página desce sozinha até os links e a rolagem fica liberada de vez.
//
// A descida NÃO rola a página quadro a quadro (isso roda no processador e engasga no celular
// enquanto o vídeo toca). Em vez disso, desliza na placa de vídeo os blocos marcados com
// data-autoscroll-move (transform, que não trava) e, no fim, troca pela rolagem de verdade
// no mesmo quadro — o olho não vê a troca.
const SCROLL_KEYS = new Set([" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp", "End", "Home"]);
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)"; // começa e termina devagar

export default function AutoScroll({ target, delay = 5000, duration = 1600 }: { target: string; delay?: number; duration?: number }) {
  useEffect(() => {
    // Sempre começa no topo (o navegador costuma voltar pra posição antiga ao recarregar)
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });

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

    let anims: Animation[] = [];
    const timer = window.setTimeout(() => {
      const el = document.getElementById(target);
      if (!el) return unlock();
      const end = el.getBoundingClientRect().top + window.scrollY;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const movers = Array.from(document.querySelectorAll<HTMLElement>("[data-autoscroll-move]"));

      const finish = () => {
        // Mesmo quadro: rola de verdade e tira o deslocamento → nada pisca
        window.scrollTo({ top: end, behavior: "instant" });
        anims.forEach((a) => a.cancel());
        anims = [];
        movers.forEach((m) => (m.style.willChange = ""));
        unlock();
      };

      if (reduce || !movers.length || typeof Element.prototype.animate !== "function") return finish();

      movers.forEach((m) => (m.style.willChange = "transform"));
      anims = movers.map((m) =>
        m.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-end}px)` }], {
          duration,
          easing: EASE,
          fill: "forwards",
        }),
      );
      anims[0].finished.then(finish, () => {});
    }, delay);

    return () => {
      window.clearTimeout(timer);
      anims.forEach((a) => a.cancel());
      unlock();
    };
  }, [target, delay, duration]);

  return null;
}
