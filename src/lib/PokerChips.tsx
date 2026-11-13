import type { IconBaseProps } from "react-icons";

// Fichas de poker coloridas (contorno preto + listras brancas na borda), no estilo cartoon.
// Diferente dos outros ícones, este tem cor própria: não segue a cor do texto.
function Chip({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  const edge = r - r * 0.17;          // onde ficam as listras brancas
  const dash = (2 * Math.PI * edge) / 12;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="#0b0b0b" strokeWidth={r * 0.16} />
      <circle cx={cx} cy={cy} r={edge} fill="none" stroke="#fff" strokeWidth={r * 0.26}
        strokeDasharray={`${dash * 0.55} ${dash * 1.45}`} transform={`rotate(-8 ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r * 0.52} fill="#fff" stroke="#0b0b0b" strokeWidth={r * 0.1} />
      <circle cx={cx} cy={cy} r={r * 0.22} fill={color} />
    </g>
  );
}

export function PokerChips({ size, className, style, title }: IconBaseProps) {
  return (
    <svg viewBox="0 0 24 24" width={size ?? "1em"} height={size ?? "1em"} className={className} style={style}
      role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <Chip cx={8.2} cy={8.4} r={6.4} color="#1f8a3b" />
      <Chip cx={15.4} cy={15.2} r={7.4} color="#e3191f" />
    </svg>
  );
}
