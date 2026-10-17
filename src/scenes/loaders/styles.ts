// The CSS of the six loaders. Plain CSS keyframes, so each one can be dropped into any
// site. The numbers here are the shape of each loader; meta.ts and the params spell
// them out in words for the prompt.

export function loaderCss(o: {
  size: number;
  thickness: number;
  scale: number;
  cols: number;
  colsSmall: number;
}): string {
  return `
.ld-wrap{position:absolute;inset:0;display:grid;grid-template-rows:1fr auto;justify-items:center;gap:1.5rem;padding:1.5rem;color:var(--ink);pointer-events:none}
.ld-main{display:grid;place-items:center;min-height:0}
.ld-main .ld{transform:scale(${o.scale})}
.ld-grid{display:grid;grid-template-columns:repeat(${o.cols},1fr);gap:1rem;pointer-events:auto}
@media (max-width:700px){.ld-grid{grid-template-columns:repeat(${o.colsSmall},1fr)}}
.ld-btn{display:grid;place-items:center;gap:.4rem;min-height:44px;padding:.75rem 1rem;background:transparent;color:var(--ink);border:2px solid var(--line);border-radius:16px;cursor:pointer;font:inherit;font-size:.85rem}
.ld-btn[aria-pressed=true]{border-color:var(--ink)}
.ld{--s:${o.size}px;--t:${o.thickness}px;width:var(--s);height:var(--s);display:flex;align-items:center;justify-content:center;position:relative}
.ld-dots{gap:calc(var(--s)*.12)}
.ld-dots i{width:calc(var(--s)*.25);height:calc(var(--s)*.25);border-radius:50%;background:var(--k);animation:ld-dot var(--d) infinite ease-in-out;animation-delay:calc(var(--d)*var(--i)*.125)}
@keyframes ld-dot{0%,80%,100%{transform:scale(.4);opacity:.4}40%{transform:scale(1);opacity:1}}
.ld-bounce{gap:calc(var(--s)*.1);align-items:flex-end}
.ld-bounce i{width:calc(var(--s)*.26);height:calc(var(--s)*.26);border-radius:50%;background:var(--k);transform-origin:50% 100%;animation:ld-bounce var(--d) infinite ease-in-out;animation-delay:calc(var(--d)*var(--i)*.15)}
@keyframes ld-bounce{0%,100%{transform:translateY(0) scale(1.25,.75)}50%{transform:translateY(calc(var(--s)*-.5)) scale(.9,1.1)}}
.ld-ring svg{width:100%;height:100%;animation:ld-spin calc(var(--d)*1.4) linear infinite}
.ld-ring circle{fill:none;stroke:var(--k);stroke-linecap:round;stroke-dasharray:100;animation:ld-draw var(--d) ease-in-out infinite}
@keyframes ld-draw{0%{stroke-dashoffset:100}50%{stroke-dashoffset:0}100%{stroke-dashoffset:-100}}
@keyframes ld-spin{to{transform:rotate(360deg)}}
.ld-bars{gap:calc(var(--s)*.08);align-items:flex-end}
.ld-bars i{width:max(var(--t),calc(var(--s)*.1));height:100%;border-radius:2px;background:var(--k);transform-origin:50% 100%;animation:ld-bar var(--d) infinite ease-in-out;animation-delay:calc(var(--d)*var(--i)*.1)}
@keyframes ld-bar{0%,100%{transform:scaleY(.2)}50%{transform:scaleY(1)}}
.ld-morph i{width:70%;height:70%;border:var(--t) solid var(--k);border-radius:12%;animation:ld-morph var(--d) infinite ease-in-out}
@keyframes ld-morph{0%{border-radius:12%;transform:rotate(0)}50%{border-radius:50%;transform:rotate(180deg) scale(.8)}100%{border-radius:12%;transform:rotate(360deg)}}
.ld-orbit{animation:ld-spin var(--d) linear infinite}
.ld-orbit::before{content:"";position:absolute;inset:calc(var(--s)*.11);border:var(--t) solid var(--k);border-radius:50%;opacity:.2}
.ld-orbit i{position:absolute;left:50%;width:calc(var(--s)*.22);height:calc(var(--s)*.22);margin-left:calc(var(--s)*-.11);border-radius:50%;background:var(--k)}
.ld-orbit i:nth-child(1){top:0}
.ld-orbit i:nth-child(2){bottom:0}
.ld-still *,.ld-still{animation-play-state:paused!important;animation-delay:calc(var(--d)*-${0.5})!important}
`;
}

/** The self-drawing ring: an SVG circle (viewBox 100) with pathLength 100, so its dashes are percentages. */
export function ringSvg(size: number, thickness: number, color: string): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  const circle = document.createElementNS(ns, 'circle');
  const stroke = (thickness * 100) / size;
  circle.setAttribute('cx', '50');
  circle.setAttribute('cy', '50');
  circle.setAttribute('r', String(50 - stroke / 2));
  circle.setAttribute('pathLength', '100');
  circle.setAttribute('stroke-width', String(stroke));
  circle.style.stroke = color;
  svg.append(circle);
  return svg;
}
