// `tilt`: Holographic card (SCENES.md #37). A DOM scene: a card rotated in CSS 3D by
// springs that chase the pointer, with a glare layer and a rainbow foil layer.

import { createPointer } from '../../engine/pointer';
import { frameFactor } from '../../engine/time';
import type { Params, SceneContext, SceneInstance, SceneModule } from '../types';
import { SHARED } from '../shared';
import { FIXED } from './constants';
import { meta } from './meta';
import { params } from './params';
import { followUps } from './prompt';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

interface OrientationApi {
  requestPermission?: () => Promise<string>;
}

function create(host: HTMLElement, initial: Params, _ctx: SceneContext): SceneInstance {
  let p = { ...initial };
  const n = (id: string) => Number(p[id]);
  const ptr = createPointer(host);
  const ac = new AbortController();

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    position: 'absolute',
    inset: '0',
    display: 'grid',
    placeItems: 'center',
    pointerEvents: 'none',
    fontVariationSettings: 'normal',
  });
  const card = document.createElement('div');
  Object.assign(card.style, {
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--surface)',
    color: 'var(--ink)',
    boxSizing: 'border-box',
    willChange: 'transform',
  });
  const content = document.createElement('div');
  Object.assign(content.style, {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    height: `${SHARED.PERCENT}%`,
    boxSizing: 'border-box',
  });
  const nameEl = document.createElement('div');
  const roleEl = document.createElement('div');
  roleEl.style.color = 'var(--ink-soft)';
  content.append(nameEl, roleEl);
  const foilEl = document.createElement('div');
  const glareEl = document.createElement('div');
  for (const layer of [foilEl, glareEl])
    Object.assign(layer.style, { position: 'absolute', inset: '0', pointerEvents: 'none' });
  foilEl.style.mixBlendMode = 'color-dodge';
  glareEl.style.mixBlendMode = 'soft-light';
  card.append(content, foilEl, glareEl);
  wrap.append(card);
  host.append(wrap);

  let W = 0;
  let H = 0;
  let cardW = 0;
  let ax = 0;
  let ay = 0;
  let vx = 0;
  let vy = 0;
  let scale = 1;
  let time = 0;
  let gyroOn = false;
  let gyroX = 0;
  let gyroY = 0;
  let button: HTMLButtonElement | undefined;

  const ratio = (a: number) => (n('maxTilt') > 0 ? clamp(a / n('maxTilt'), -1, 1) : 0);

  function layout(): void {
    cardW = Math.min(
      n('cardWidth'),
      W * FIXED.MAX_WIDTH_SHARE,
      (H * FIXED.MAX_HEIGHT_SHARE) / n('aspect'),
    );
    const pad = cardW * FIXED.PADDING;
    Object.assign(card.style, {
      width: `${cardW}px`,
      height: `${cardW * n('aspect')}px`,
      borderRadius: `${n('radius')}px`,
      boxShadow: `0 ${cardW * FIXED.SHADOW_OFFSET}px ${FIXED.SHADOW_BLUR}px color-mix(in srgb, var(--ink) ${FIXED.SHADOW_ALPHA}%, transparent)`,
    });
    content.style.padding = `${pad}px`;
    Object.assign(nameEl.style, {
      fontSize: `${cardW * FIXED.NAME_SIZE}px`,
      fontWeight: String(FIXED.NAME_WEIGHT),
      lineHeight: String(FIXED.LINE_HEIGHT),
      overflowWrap: 'anywhere',
    });
    Object.assign(roleEl.style, {
      fontSize: `${cardW * FIXED.ROLE_SIZE}px`,
      fontWeight: String(FIXED.ROLE_WEIGHT),
      marginTop: '0.5em',
    });
    nameEl.textContent = String(p.name);
    roleEl.textContent = String(p.role);
    wrap.style.perspective = `${n('perspective')}px`;
    const stops = FIXED.FOIL_STOPS;
    const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c1)'];
    foilEl.style.backgroundImage = `linear-gradient(${n('foilAngle')}deg, ${colors.map((c, i) => `${c} ${stops[i]}%`).join(', ')})`;
    foilEl.style.backgroundSize = `${n('foilSize')}% ${n('foilSize')}%`;
    foilEl.style.opacity = String(n('foil'));
    glareEl.style.opacity = String(n('glare'));
    syncButton();
  }

  function apply(): void {
    card.style.transform = `rotateX(${ax.toFixed(2)}deg) rotateY(${ay.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    const rx = ratio(ax);
    const ry = ratio(ay);
    const gx = SHARED.PERCENT * (0.5 + FIXED.GLARE_TRAVEL * ry);
    const gy = SHARED.PERCENT * (0.5 - FIXED.GLARE_TRAVEL * rx);
    glareEl.style.backgroundImage = `radial-gradient(circle at ${gx.toFixed(1)}% ${gy.toFixed(1)}%, var(--ink) 0%, transparent ${n('glareSize')}%)`;
    const fx = SHARED.PERCENT * 0.5 + n('foilShift') * ry;
    const fy = SHARED.PERCENT * 0.5 - n('foilShift') * rx;
    foilEl.style.backgroundPosition = `${fx.toFixed(1)}% ${fy.toFixed(1)}%`;
  }

  function onOrient(e: DeviceOrientationEvent): void {
    gyroY = n('maxTilt') * clamp((e.gamma ?? 0) / FIXED.GYRO_RANGE, -1, 1);
    gyroX = n('maxTilt') * clamp(((e.beta ?? 0) - FIXED.GYRO_REST) / FIXED.GYRO_RANGE, -1, 1);
  }

  async function enableMotion(): Promise<void> {
    const api = DeviceOrientationEvent as unknown as OrientationApi;
    if (typeof api.requestPermission === 'function') {
      try {
        if ((await api.requestPermission()) !== 'granted') return;
      } catch {
        return;
      }
    }
    if (ac.signal.aborted) return;
    window.addEventListener('deviceorientation', onOrient, { signal: ac.signal });
    gyroOn = true;
    syncButton();
  }

  function syncButton(): void {
    const wanted =
      !!p.gyro &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      (typeof (DeviceOrientationEvent as unknown as OrientationApi).requestPermission ===
        'function' ||
        window.matchMedia('(pointer: coarse)').matches);
    if (!wanted) {
      button?.remove();
      button = undefined;
      return;
    }
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      Object.assign(button.style, {
        position: 'absolute',
        bottom: `${FIXED.BUTTON_BOTTOM}rem`,
        left: `${SHARED.PERCENT * 0.5}%`,
        transform: `translateX(-${SHARED.PERCENT * 0.5}%)`,
        pointerEvents: 'auto',
        minHeight: `${FIXED.BUTTON_HEIGHT}rem`,
        padding: `0 ${FIXED.BUTTON_PAD}rem`,
        border: '1px solid var(--line)',
        borderRadius: `${FIXED.PILL}px`,
        background: 'var(--surface)',
        color: 'var(--ink)',
        font: 'inherit',
      });
      button.addEventListener('click', () => void enableMotion(), { signal: ac.signal });
      host.append(button);
    }
    button.textContent = gyroOn ? 'Motion is on' : 'Use motion';
    button.disabled = gyroOn;
  }

  return {
    resize() {
      W = host.clientWidth;
      H = host.clientHeight;
      layout();
      apply();
    },
    update(dt, _t) {
      const f = frameFactor(dt);
      time += dt;
      ptr.sync();
      const mt = n('maxTilt');
      let ty: number;
      let tx: number;
      if (gyroOn) {
        ty = gyroY;
        tx = gyroX;
      } else if (ptr.active) {
        ty = mt * clamp((ptr.x - W * 0.5) / (W * 0.5), -1, 1);
        tx = -mt * clamp((ptr.y - H * 0.5) / (H * 0.5), -1, 1);
      } else {
        const w = time * n('swaySpeed');
        ty = mt * n('sway') * Math.sin(w);
        tx = mt * n('sway') * Math.sin(w * FIXED.WANDER_RATIO + FIXED.WANDER_PHASE);
      }
      const damp = Math.pow(n('damping'), f);
      vx = (vx + (tx - ax) * n('spring') * f) * damp;
      vy = (vy + (ty - ay) * n('spring') * f) * damp;
      ax += vx * f;
      ay += vy * f;
      const lifted = ptr.active && !gyroOn ? n('lift') : 1;
      scale += (lifted - scale) * (1 - Math.pow(1 - n('spring'), f));
      ptr.takeTaps();
      apply();
    },
    still() {
      ptr.takeTaps();
      ax = FIXED.STILL_TILT[0];
      ay = FIXED.STILL_TILT[1];
      vx = 0;
      vy = 0;
      scale = 1;
      apply();
    },
    setParams(next) {
      p = { ...next };
      if (W) {
        layout();
        apply();
      }
    },
    setTheme() {
      /* colors come from CSS variables */
    },
    restart() {
      ax = 0;
      ay = 0;
      vx = 0;
      vy = 0;
      scale = 1;
      time = 0;
      apply();
    },
    destroy() {
      ac.abort();
      ptr.destroy();
      button?.remove();
      wrap.remove();
    },
  };
}

const scene: SceneModule = { meta, params, followUps, create };
export default scene;
