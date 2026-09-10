/* Flat line-art illustration set — components.md §7 of the redesign handoff.
   Single-weight black line, ~3px stroke, rounded caps, loose and slightly
   imperfect. Exactly one signal-orange accent fill per drawing, on a single
   small shape. Figures are operators — people at desks with laptops and
   account lists — never funnel abstractions or robots. Ship as inline SVG
   so stroke-width can stay non-scaling via CSS (see .ill-frame in
   index.css). Illustration is banned inside working screens — these three
   slots are the only places it appears: the landing hero, the dashboard
   all-weeks-complete state, and the empty exception queue. */
import type { SVGProps } from 'react'

type Pose = {
  x: number
  y: number
  scale?: number
  armL?: number
  armR?: number
}

/** One loose figure: circle head, capsule torso, simple limbs. */
function Figure({ x, y, scale = 1, armL = 20, armR = -20 }: Pose) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cx="0" cy="-58" r="14" />
      <path d="M-11 -46 C -14 -20, -14 6, -10 26 M11 -46 C 14 -20, 14 6, 10 26" />
      <path d="M-11 -46 Q 0 -40 11 -46" />
      <path d="M-10 26 L -16 58 M10 26 L 16 58" />
      <path d={`M-11 -38 L ${-11 + 18 * Math.sin((armL * Math.PI) / 180)} ${-38 + 18 * Math.cos((armL * Math.PI) / 180)}`} />
      <path d={`M11 -38 L ${11 + 18 * Math.sin((armR * Math.PI) / 180)} ${-38 + 18 * Math.cos((armR * Math.PI) / 180)}`} />
    </g>
  )
}

/** Landing hero — operator at a laptop, one account-list row highlighted. */
export function IllHero(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 420 360" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" {...props}>
      <Figure x={150} y={340} scale={1.7} armL={44} armR={-8} />
      {/* laptop */}
      <path d="M205 268 h150 l12 40 h-174 z" />
      <path d="M218 268 v-64 h124 v64" />
      {/* account list on screen */}
      <path d="M232 224 h96 M232 240 h96" opacity="0.55" />
      <rect x="230" y="204" width="100" height="14" rx="3" fill="var(--color-signal)" stroke="none" />
      <path d="M256 211 h50" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />
      {/* browser card, upper right */}
      <path d="M280 40 h130 a8 8 0 0 1 8 8 v96 a8 8 0 0 1 -8 8 h-130 a8 8 0 0 1 -8 -8 v-96 a8 8 0 0 1 8 -8 Z" />
      <path d="M272 66 h146" />
      <circle cx="288" cy="53" r="3" />
      <circle cx="300" cy="53" r="3" />
      <path d="M296 90 h94 M296 108 h68 M296 126 h80" opacity="0.55" />
    </svg>
  )
}

/** Dashboard · track-complete card — figure holding a certificate scroll overhead. */
export function IllComplete(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 250 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" {...props}>
      <g transform="translate(125 108) scale(0.85)">
        <circle cx="0" cy="-58" r="14" />
        <path d="M-11 -46 C -14 -20, -14 6, -10 26 M11 -46 C 14 -20, 14 6, 10 26" />
        <path d="M-10 26 L -16 58 M10 26 L 16 58" />
        <path d="M-11 -40 C -20 -58, -18 -78, -8 -90" />
        <path d="M11 -40 C 20 -58, 18 -78, 8 -90" />
      </g>
      <rect x="105" y="8" width="40" height="14" rx="2" transform="rotate(-4 125 15)" />
      <path d="M112 8 v-4 M138 8 v-4" />
      <circle cx="140" cy="24" r="3.4" fill="var(--color-signal)" stroke="none" />
    </svg>
  )
}

/** Mentor queue · empty state — figure leaning back, empty tray on the desk. */
export function IllEmptyQueue(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 220 130" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" {...props}>
      <g transform="translate(120 118) scale(0.72) rotate(-6)">
        <circle cx="0" cy="-58" r="14" />
        <path d="M-11 -46 C -16 -20, -14 6, -8 24 M11 -46 C 16 -20, 16 6, 12 24" />
        <path d="M-8 24 L -14 58 M12 24 L 20 56" />
        <path d="M-11 -40 C -30 -46, -34 -30, -30 -14" />
        <path d="M11 -40 C 26 -50, 34 -42, 32 -28" />
      </g>
      <rect x="30" y="90" width="90" height="8" rx="2" />
      <rect x="42" y="72" width="50" height="16" rx="2" />
      <path d="M45 76 h44 M45 82 h30" opacity="0.5" />
      <circle cx="168" cy="80" r="3.4" fill="var(--color-signal)" stroke="none" />
    </svg>
  )
}
