"use client";

import { useId } from "react";
import type { IconBaseProps } from "react-icons";

// Duas fichas de poker na cor do texto (igual aos outros ícones).
// As listras da borda e o anel do meio são vazados (máscara), o que dá a cara de ficha.
function chipMask(cx: number, cy: number, r: number) {
  const edge = r * 0.8;
  const dash = (2 * Math.PI * edge) / 8;
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="#fff" />
      {/* listras da borda vazadas */}
      <circle cx={cx} cy={cy} r={edge} fill="none" stroke="#000" strokeWidth={r * 0.34}
        strokeDasharray={`${dash * 0.42} ${dash * 0.58}`} transform={`rotate(-12 ${cx} ${cy})`} />
      {/* anel fino separando o miolo */}
      <circle cx={cx} cy={cy} r={r * 0.5} fill="none" stroke="#000" strokeWidth={r * 0.13} />
    </>
  );
}

export function PokerChips({ size, className, style, title }: IconBaseProps) {
  const id = useId().replace(/:/g, "");
  const front = { cx: 15, cy: 15, r: 8.2 };
  const back = { cx: 8.4, cy: 8.4, r: 7 };
  return (
    <svg viewBox="0 0 24 24" width={size ?? "1em"} height={size ?? "1em"} className={className} style={style}
      fill="currentColor" role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <mask id={`b${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          {chipMask(back.cx, back.cy, back.r)}
          {/* folga em volta da ficha da frente */}
          <circle cx={front.cx} cy={front.cy} r={front.r + 1.3} fill="#000" />
        </mask>
        <mask id={`f${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
          {chipMask(front.cx, front.cy, front.r)}
        </mask>
      </defs>
      <rect width="24" height="24" mask={`url(#b${id})`} />
      <rect width="24" height="24" mask={`url(#f${id})`} />
    </svg>
  );
}
