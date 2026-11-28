/**
 * The sushi conveyor belt: the hero layout, the moving belt of plates, the colour board filter and the plate card.
 * Based on the "Sushi Conveyor Menu" component from 21st.dev, adapted for this site (plate designs per category,
 * NEW flag, render props for titles, descriptions, chips and card actions).
 *
 * What this file does not hold: content (src/data) and what goes inside a card (App.tsx passes render props).
 */
import * as React from "react";
import { createPortal } from "react-dom";

/** Category: 1 Education · 2 Experience · 3 Projects. Picks the plate design and the colour board entry. */
export type DishTier = 1 | 2 | 3;

export interface ConveyorDish {
  id: string;
  /** Accessible name, chip text and dialog title. */
  name: string;
  /** One or two sentences for the caption and the dialog. */
  description?: string;
  /** Price text such as "$4.20", shown on the chip, the caption and the dialog. */
  price: string;
  /** Price tier 1–5. Kaiten plates are colour-coded by price, so the tier is drawn as the plate ring in chart colour 1–5. */
  tier?: DishTier;
  /** Top-down photo of the plate, centred on a transparent square canvas. */
  image: string;
  /** Short facts such as the piece count or allergens, listed as chips in the dialog. */
  details?: string[];
  /** Optional link shown in the dialog in place of the add button, e.g. "View on GitHub". */
  link?: { label: string; href: string };
  /** Optional short marker pinned to the plate, e.g. "Now" for the current role. */
  badge?: string;
}

export interface SushiConveyorMenuLabels {
  add: string;
  close: string;
  previous: string;
  next: string;
  /** Accessible name of the pause toggle. */
  pause?: string;
}

export interface SushiConveyorMenuProps extends React.ComponentProps<"section"> {
  items: ConveyorDish[];
  eyebrow?: React.ReactNode;
  heading?: string;
  /** Shown under the belt while no plate is picked out. */
  caption?: string;
  /** Call to action rendered under the caption. */
  action?: React.ReactNode;
  /** Cruise speed of the belt in px/s, measured on the front lane. */
  speed?: number;
  /** Stops the belt (controlled). */
  paused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  /** Brings one plate after another to the front and lifts it, until the visitor interacts. */
  autoplay?: boolean;
  /** Milliseconds between autoplay plates. */
  interval?: number;
  /** Index of the lifted plate (controlled). */
  active?: number | null;
  onActiveChange?: (index: number | null) => void;
  onOpenChange?: (index: number | null) => void;
  /** Called by the dialog's add button. */
  onAdd?: (item: ConveyorDish) => void;
  /** Price label per tier for the legend. Derived from the items when omitted. */
  legend?: { [tier: number]: string };
  labels?: SushiConveyorMenuLabels;
  /** Optional rich description for the dialog (e.g. text with tooltips). Falls back to item.description. */
  renderDescription?: (item: ConveyorDish) => React.ReactNode;
  /** Optional replacement for the dialog title, e.g. the name with a hover explanation. */
  renderTitle?: (item: ConveyorDish) => React.ReactNode;
  /** Optional dialog buttons that replace the default add button / link. Return null/undefined to keep the default. */
  renderActions?: (item: ConveyorDish) => React.ReactNode;
  /** Optional rich rendering for one detail chip in the dialog (e.g. a term with a tooltip). Falls back to the text. */
  renderDetail?: (detail: string, item: ConveyorDish) => React.ReactNode;
}

const SPACING = 1.35;
const CURVE = 0.95;
const BAND = 1.22;
const TILT = 0.8;
const SLAT = 0.34;
const LIFT_Y = -6;
const LIFT_SCALE = 0.08;
const BACK_SHADE = 0.15;
const CHIP_ROOM = 34;
const WIDE = 1024;
const HOLD = 1400;
const RUN = 0;
const SEEK = 1;
const DRAG = 2;
const DEFAULT_LABELS: SushiConveyorMenuLabels = { add: "Add to order", close: "Close", previous: "Previous plate", next: "Next plate", pause: "Pause belt" };
/** One plate design per category (tier 1–3), after the Sushi Express price-plate poster. Drawn by scripts/dishes/plates.mjs. */
const TIERS = [
  { ring: "border-chart-1", dot: "bg-chart-1", color: "var(--chart-1)", plate: "assets/plates/plate-education.webp" },
  { ring: "border-chart-2", dot: "bg-chart-2", color: "var(--chart-2)", plate: "assets/plates/plate-experience.webp" },
  { ring: "border-chart-3", dot: "bg-chart-3", color: "var(--chart-3)", plate: "assets/plates/plate-projects.webp" },
] as const;
const THEME =
  "[--belt:color-mix(in_oklab,var(--color-foreground)_78%,var(--color-background))] dark:[--belt:color-mix(in_oklab,var(--color-foreground)_16%,var(--color-background))] " +
  "[--belt-side:color-mix(in_oklab,var(--color-foreground)_92%,var(--color-background))] dark:[--belt-side:color-mix(in_oklab,var(--color-foreground)_7%,var(--color-background))] " +
  "[--rail:color-mix(in_oklab,var(--color-muted-foreground)_45%,white)] dark:[--rail:color-mix(in_oklab,var(--color-muted-foreground)_72%,var(--color-background))] " +
  "[--island:color-mix(in_oklab,var(--color-muted-foreground)_16%,var(--color-background))] dark:[--island:color-mix(in_oklab,var(--color-foreground)_13%,var(--color-background))] " +
  "[--island-low:color-mix(in_oklab,var(--color-muted-foreground)_27%,var(--color-background))] dark:[--island-low:color-mix(in_oklab,var(--color-foreground)_8%,var(--color-background))] " +
  "[--island-wall:color-mix(in_oklab,var(--color-muted-foreground)_42%,var(--color-background))] dark:[--island-wall:color-mix(in_oklab,var(--color-foreground)_5%,var(--color-background))]";

type Geo = {
  width: number; height: number; d: number; r: number; s: number; l: number; pitch: number; n: number;
  kb: number; cx: number; ym: number; a: number; b: number; band: number; slats: number; side: number; edgeTop: number;
};
type Point = { x: number; z: number; nx: number; nz: number; tx: number; tz: number };
type Sim = {
  offset: number; v: number; mode: number; target: number;
  lift: number[]; vlift: number[]; z: number[]; lane: string[];
  raf: number; last: number; visible: boolean; init: boolean; touched: boolean; l: number; center: number; published: string;
  px: number; py: number; inside: boolean; lock: boolean; lockX: number; lockY: number;
};

function makeSim(): Sim {
  return { offset: 0, v: 0, mode: RUN, target: 0, lift: [], vlift: [], z: [], lane: [], raf: 0, last: 0, visible: true, init: false, touched: false, l: 0, center: -1, published: "", px: 0, py: 0, inside: false, lock: false, lockX: 0, lockY: 0 };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function tierStyle(tier: number | undefined) {
  return TIERS[clamp(Math.round(tier ?? 1), 1, TIERS.length) - 1] ?? TIERS[0];
}

/** Kaiten-style plate under the dish: one plate design per category (after the Sushi Express plate poster), so the plate itself says which section it belongs to. */
function PlatePaint({ src }: { src: string }) {
  return <img src={src} alt="" aria-hidden="true" draggable={false} data-plate className="pointer-events-none absolute inset-0 size-full select-none object-fill" />;
}

/** A little tent-card stand ("NEW") sitting on the back-right rim of the plate, like the triangular signs on a sushi belt. Sized in % of the plate so it scales with it. */
function DishFlag({ text }: { text: string }) {
  return (
    <svg aria-hidden="true" data-flag viewBox="0 0 64 46" className="pointer-events-none absolute bottom-[80.7%] left-[67.4%] w-[18.6%] overflow-visible">
      <ellipse cx="31" cy="42.5" rx="27" ry="3.2" fill="#000" opacity=".28" />
      <path d="M50 41 L58 37 L47 5 Z" fill="#9e1a32" />
      <path d="M6 41 H50 L47 5 H9 Z" fill="#dc2f4b" />
      <path d="M8.2 38.6 H47.8 L45.3 7.4 H10.7 Z" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.1" />
      <path d="M9 5 H47" stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
      <text x="28" y="27.6" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" letterSpacing=".8" fontFamily="system-ui, sans-serif">{text.toUpperCase()}</text>
    </svg>
  );
}

const PLATE_MASK = "radial-gradient(closest-side, #000 96.1%, transparent 96.6%)";

/** Position on the stadium loop. u is arc length on the belt, the front lane runs right to left and the back lane left to right. */
function along(g: Geo, u: number): Point {
  const { s, r } = g;
  let t = ((u % g.l) + g.l) % g.l;
  if (t < s) return { x: s / 2 - t, z: r, nx: 0, nz: 1, tx: -1, tz: 0 };
  t -= s;
  const arc = Math.PI * r;
  if (t < arc) {
    const f = t / r;
    const sin = Math.sin(f);
    const cos = Math.cos(f);
    return { x: -s / 2 - r * sin, z: r * cos, nx: -sin, nz: cos, tx: -cos, tz: -sin };
  }
  t -= arc;
  if (t < s) return { x: -s / 2 + t, z: -r, nx: 0, nz: -1, tx: 1, tz: 0 };
  t -= s;
  const f = Math.min(Math.PI, t / r);
  const sin = Math.sin(f);
  const cos = Math.cos(f);
  return { x: s / 2 + r * sin, z: -r * cos, nx: sin, nz: -cos, tx: cos, tz: sin };
}

/** Perspective-ish projection: the back lane shrinks to kb and the depth axis is foreshortened by TILT. */
function project(g: Geo, x: number, z: number) {
  const k = g.a + g.b * z;
  return { x: g.cx + x * k, y: g.ym + TILT * (g.a * z + (g.b * z * z) / 2), k };
}

function makeGeo(width: number, n: number, d: number, kb: number): Geo {
  const l = Math.max(1, n) * SPACING * d;
  const r = Math.min(CURVE * d, l / (2 * Math.PI));
  const s = Math.max(0, (l - 2 * Math.PI * r) / 2);
  const g: Geo = { width, height: 0, d, r, s, l, pitch: l / Math.max(1, n), n: Math.max(1, n), kb, cx: width / 2, ym: 0, a: (1 + kb) / 2, b: (1 - kb) / (2 * r), band: BAND * d, slats: Math.max(10, Math.round(l / (SLAT * d))), side: Math.max(3, d * 0.07), edgeTop: 0 };
  let top = Infinity;
  let bottom = -Infinity;
  let edge = Infinity;
  for (let j = 0; j < 120; j++) {
    const p = along(g, (j / 120) * l);
    const rim = project(g, p.x + (p.nx * g.band) / 2, p.z + (p.nz * g.band) / 2);
    const plate = project(g, p.x, p.z);
    const half = (plate.k * d * TILT) / 2;
    edge = Math.min(edge, rim.y);
    top = Math.min(top, rim.y, plate.y + (LIFT_Y / 100) * half * 2 - half * (1 + LIFT_SCALE) - CHIP_ROOM);
    bottom = Math.max(bottom, rim.y + g.side + d * 0.06, plate.y + half + d * 0.08);
  }
  g.ym = Math.ceil(-top) + 2;
  g.height = Math.ceil(bottom - top) + 4;
  g.edgeTop = edge + g.ym;
  return g;
}

function halfSpan(g: Geo) {
  let span = 0;
  for (let j = 0; j < 120; j++) {
    const p = along(g, (j / 120) * g.l);
    const rim = project(g, p.x + (p.nx * g.band) / 2, p.z + (p.nz * g.band) / 2);
    const plate = project(g, p.x, p.z);
    span = Math.max(span, Math.abs(rim.x - g.cx) + 3, Math.abs(plate.x - g.cx) + (plate.k * g.d * (1 + LIFT_SCALE)) / 2);
  }
  return span;
}

function edgePath(g: Geo, offset: number) {
  let d = "";
  const steps = 168;
  for (let j = 0; j < steps; j++) {
    const p = along(g, (j / steps) * g.l);
    const q = project(g, p.x + p.nx * offset, p.z + p.nz * offset);
    d += `${j ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }
  return `${d}Z`;
}

/** Crescent slat seams across the belt, redrawn every frame so they travel with the plates (and round the curves). */
function slatPath(g: Geo, offset: number, shift: number) {
  const half = g.band * 0.46;
  const pitch = g.l / g.slats;
  const bulge = pitch * 0.2;
  let d = "";
  for (let j = 0; j < g.slats; j++) {
    const p = along(g, offset + shift + j * pitch);
    const inner = project(g, p.x - p.nx * half, p.z - p.nz * half);
    const outer = project(g, p.x + p.nx * half, p.z + p.nz * half);
    const mid = project(g, p.x + p.tx * bulge, p.z + p.tz * bulge);
    d += `M${inner.x.toFixed(1)} ${inner.y.toFixed(1)}Q${(2 * mid.x - (inner.x + outer.x) / 2).toFixed(1)} ${(2 * mid.y - (inner.y + outer.y) / 2).toFixed(1)} ${outer.x.toFixed(1)} ${outer.y.toFixed(1)}`;
  }
  return d;
}

function pose(g: Geo, offset: number, i: number) {
  const p = along(g, offset - i * g.pitch);
  const q = project(g, p.x, p.z);
  return { x: q.x, y: q.y, k: q.k, depth: (p.z + g.r) / (2 * g.r) };
}

function centerOf(g: Geo, offset: number) {
  return ((Math.round((offset - g.s / 2) / g.pitch) % g.n) + g.n) % g.n;
}

function legendEntries(items: ConveyorDish[], legend: { [tier: number]: string } | undefined) {
  const out = [] as { tier: number; label: string }[];
  for (let tier = 1; tier <= 5; tier++) {
    const label = legend ? legend[tier] : items.find((item) => (item.tier ?? 1) === tier)?.price;
    if (label) out.push({ tier, label });
  }
  return out;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function SushiConveyorMenu({
  items,
  eyebrow,
  heading,
  caption,
  action,
  speed = 26,
  paused: pausedProp,
  onPausedChange,
  autoplay = false,
  interval = 3000,
  active: activeProp,
  onActiveChange,
  onOpenChange,
  onAdd,
  legend,
  labels = DEFAULT_LABELS,
  renderDescription,
  renderTitle,
  renderActions,
  renderDetail,
  className,
  ref,
  ...rest
}: SushiConveyorMenuProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const sectionRef = React.useRef(null as HTMLElement | null);
  const stageRef = React.useRef(null as HTMLDivElement | null);
  const beltRef = React.useRef(null as HTMLDivElement | null);
  const seamRef = React.useRef(null as SVGPathElement | null);
  const glintRef = React.useRef(null as SVGPathElement | null);
  const plates = React.useRef([] as (HTMLButtonElement | null)[]);
  const lifts = React.useRef([] as (HTMLSpanElement | null)[]);
  const shades = React.useRef([] as (HTMLSpanElement | null)[]);
  const shadows = React.useRef([] as (HTMLSpanElement | null)[]);
  const anchors = React.useRef([] as (HTMLSpanElement | null)[]);
  const sim = React.useRef(makeSim());
  const pointer = React.useRef({ id: -1, index: -1, x: 0, y: 0, moved: false, start: 0, lane: 1, lastX: 0, lastT: 0, v: 0 });
  const pendingOpen = React.useRef(-1);
  const returnFocus = React.useRef(null as number | null);
  const autoActive = React.useRef(null as number | null);
  const autoLast = React.useRef(null as number | null);
  const [size, setSize] = React.useState({ section: 0, stage: 0 });
  const [innerActive, setInnerActive] = React.useState(null as number | null);
  const [innerPaused, setInnerPaused] = React.useState(false);
  const [openIndex, setOpenIndex] = React.useState(null as number | null);
  const [lifted, setLifted] = React.useState(null as number | null);
  const [reduced, setReduced] = React.useState(() => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [playing, setPlaying] = React.useState(autoplay);
  const [center, setCenter] = React.useState(0);
  const [failed, setFailed] = React.useState({} as { [id: string]: boolean });
  const [filter, setFilter] = React.useState(null as number | null);

  const requested = activeProp !== undefined ? activeProp : innerActive;
  const active = requested !== null && requested >= 0 && requested < count ? requested : null;
  const paused = pausedProp ?? innerPaused;
  const wide = size.section >= WIDE;
  const narrow = size.section > 0 && size.section < 480;
  const kb = narrow ? 0.6 : 0.68;

  const geo = React.useMemo(() => {
    if (!size.stage || count === 0) return null;
    const span = halfSpan(makeGeo(1000, count, 100, kb)) / 100;
    const cap = wide ? 150 : clamp(size.section * 0.143, 96, 150);
    const fit = (size.stage - 8) / (2 * span);
    return makeGeo(size.stage, count, Math.round(clamp(fit, Math.min(wide ? 64 : 96, cap), cap)), kb);
  }, [size.stage, size.section, count, kb, wide]);

  const live = React.useRef({
    geo: null as Geo | null, active: null as number | null, paused: false, reduced: false, open: false, count: 0, speed: 26,
    activeControlled: false, pausedControlled: false,
    onActiveChange: undefined as ((index: number | null) => void) | undefined,
    onPausedChange: undefined as ((value: boolean) => void) | undefined,
    onOpenChange: undefined as ((index: number | null) => void) | undefined,
    onAdd: undefined as ((item: ConveyorDish) => void) | undefined,
  });
  live.current = {
    geo, active, paused, reduced, open: openIndex !== null, count, speed: Math.max(0, speed),
    activeControlled: activeProp !== undefined, pausedControlled: pausedProp !== undefined,
    onActiveChange, onPausedChange, onOpenChange, onAdd,
  };

  const setSectionRef = React.useCallback((node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  const paintPlate = React.useCallback((i: number) => {
    const L = live.current;
    const g = L.geo;
    const s = sim.current;
    const button = plates.current[i];
    if (!g || !button) return;
    const q = pose(g, s.offset, i);
    const e = s.lift[i] ?? 0;
    button.style.transform = `translate3d(${(q.x - g.d / 2).toFixed(2)}px,${(q.y - (g.d * TILT) / 2).toFixed(2)}px,0) scale(${q.k.toFixed(4)})`;
    const z = i === L.active ? 2000 : 100 + Math.round(q.y);
    if (s.z[i] !== z) { s.z[i] = z; button.style.zIndex = String(z); }
    const lane = q.depth >= 0.5 ? "front" : "back";
    if (s.lane[i] !== lane) { s.lane[i] = lane; button.dataset.lane = lane; }
    const lift = lifts.current[i];
    if (lift) lift.style.transform = `translateY(${(LIFT_Y * e).toFixed(3)}%) scale(${(1 + LIFT_SCALE * e).toFixed(4)})`;
    const shade = shades.current[i];
    if (shade) shade.style.opacity = (BACK_SHADE * clamp(1 - q.depth, 0, 1) * (1 - 0.7 * clamp(e, 0, 1))).toFixed(3);
    const shadow = shadows.current[i];
    if (shadow) {
      shadow.style.transform = `translate3d(0,${(g.d * TILT * 0.05 * e).toFixed(2)}px,0) scale(${(1 + 0.14 * e).toFixed(3)})`;
      shadow.style.opacity = (1 - 0.5 * clamp(e, 0, 1)).toFixed(3);
    }
    const anchor = anchors.current[i];
    if (anchor) anchor.style.transform = `scale(${(1 / (q.k * (1 + LIFT_SCALE * e))).toFixed(4)})`;
  }, []);

  const paintBelt = React.useCallback(() => {
    const L = live.current;
    const g = L.geo;
    const s = sim.current;
    if (!g) return;
    seamRef.current?.setAttribute("d", slatPath(g, s.offset, 0));
    glintRef.current?.setAttribute("d", slatPath(g, s.offset, -Math.max(1.4, g.d * 0.024)));
    const v = (Math.abs(s.v) < 0.005 ? 0 : s.v).toFixed(2);
    if (v !== s.published) { s.published = v; beltRef.current?.style.setProperty("--belt-v", v); }
    const c = centerOf(g, s.offset);
    if (c !== s.center) { s.center = c; setCenter(c); }
  }, []);

  const paintAll = React.useCallback(() => {
    for (let i = 0; i < live.current.count; i++) paintPlate(i);
    paintBelt();
  }, [paintPlate, paintBelt]);

  const hitTest = React.useCallback((px: number, py: number) => {
    const L = live.current;
    const g = L.geo;
    const s = sim.current;
    if (!g) return null;
    let best = null as number | null;
    let bestY = -Infinity;
    for (let i = 0; i < L.count; i++) {
      const q = pose(g, s.offset, i);
      const e = clamp(s.lift[i] ?? 0, 0, 1.2);
      const grow = (1 + LIFT_SCALE * e) * (i === L.active ? 1.1 : 1);
      const rx = (g.d * q.k * grow) / 2;
      const ry = (g.d * TILT * q.k * grow) / 2;
      const dx = (px - q.x) / rx;
      const dy = (py - (q.y + (LIFT_Y / 100) * g.d * TILT * q.k * e)) / ry;
      if (dx * dx + dy * dy > 1) continue;
      if (i === L.active) return i;
      if (q.y > bestY) { best = i; bestY = q.y; }
    }
    return best;
  }, []);

  const hoverRef = React.useRef((hit: number | null) => { void hit; });

  const tick = React.useCallback((now: number) => {
    const s = sim.current;
    const L = live.current;
    const g = L.geo;
    s.raf = 0;
    if (!g || !s.visible) { s.last = 0; return; }
    const dt = s.last ? clamp((now - s.last) / 1000, 0, 0.25) : 1 / 60;
    s.last = now;
    // Sub-steps keep the springs stable and the belt on real time when frames arrive late.
    const steps = Math.max(1, Math.ceil(dt / 0.017));
    const h = dt / steps;
    const stopped = L.paused || L.active !== null || L.open;
    const cruise = L.reduced ? 0 : L.speed;
    for (let step = 0; step < steps; step++) {
      if (s.mode === SEEK) {
        const w = 5.6;
        s.v += (w * w * (s.target - s.offset) - 2 * w * s.v) * h;
        s.offset += s.v * h;
        if (Math.abs(s.target - s.offset) < 0.3 && Math.abs(s.v) < 4) { s.offset = s.target; s.v = 0; s.mode = RUN; }
      } else if (s.mode === RUN) {
        if (stopped) {
          s.v *= Math.exp(-7.2 * h);
          if (Math.abs(s.v) < 0.02) s.v = 0;
        } else {
          let e = s.v - cruise;
          if (Math.abs(e) > Math.max(6, cruise * 0.5)) e = Math.sign(e) * Math.max(0, Math.abs(e) * Math.exp(-2.4 * h) - 90 * h);
          else e *= Math.exp(-3.4 * h);
          s.v = cruise + (Math.abs(e) < 0.01 ? 0 : e);
        }
        s.offset += s.v * h;
      }
      for (let i = 0; i < L.count; i++) {
        const goal = i === L.active ? 1 : 0;
        if (L.reduced) { s.lift[i] = goal; s.vlift[i] = 0; continue; }
        const x = s.lift[i] ?? 0;
        const v = (s.vlift[i] ?? 0) + (330 * (goal - x) - 23 * (s.vlift[i] ?? 0)) * h;
        s.lift[i] = x + v * h;
        s.vlift[i] = v;
      }
    }
    let busy = s.mode !== RUN || s.v !== 0 || (!stopped && cruise > 0);
    for (let i = 0; i < L.count; i++) {
      const goal = i === L.active ? 1 : 0;
      if (Math.abs(goal - (s.lift[i] ?? 0)) < 0.002 && Math.abs(s.vlift[i] ?? 0) < 0.02) { s.lift[i] = goal; s.vlift[i] = 0; }
      else busy = true;
    }
    if (s.inside && !s.lock && s.mode === RUN && !L.open && pointer.current.id < 0 && Math.abs(s.v) > 0.3) {
      const hit = hitTest(s.px, s.py);
      if (hit !== null && hit !== L.active) hoverRef.current(hit);
    }
    paintAll();
    if (busy) s.raf = requestAnimationFrame(tick);
    else s.last = 0;
  }, [hitTest, paintAll]);

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (s.raf || !s.visible) return;
    s.last = 0;
    s.raf = requestAnimationFrame(tick);
  }, [tick]);

  const setActive = React.useCallback((next: number | null) => {
    const L = live.current;
    if (L.active === next) return;
    if (!L.activeControlled) { L.active = next; setInnerActive(next); }
    L.onActiveChange?.(next);
    kick();
  }, [kick]);

  const stop = React.useCallback(() => {
    setPlaying(false);
    const s = sim.current;
    s.touched = true;
    if (s.mode === SEEK) s.mode = RUN;
    const auto = autoActive.current;
    if (auto !== null) {
      autoActive.current = null;
      if (live.current.active === auto) setActive(null);
    }
  }, [setActive]);

  const seekTo = React.useCallback((index: number) => {
    const s = sim.current;
    const g = live.current.geo;
    if (!g) return;
    const base = g.s / 2 + index * g.pitch;
    s.target = base + Math.round((s.offset - base) / g.l) * g.l;
    if (live.current.reduced) { s.offset = s.target; s.v = 0; s.mode = RUN; paintAll(); return; }
    s.mode = SEEK;
    kick();
  }, [kick, paintAll]);

  const focusVisible = () => !!stageRef.current?.querySelector("[data-dish]:focus-visible");

  hoverRef.current = (hit: number | null) => {
    const current = live.current.active;
    if (hit === current) {
      // The visitor takes over the plate autoplay lifted: autoplay stops and the plate stays up.
      if (hit !== null && autoActive.current === hit) { autoActive.current = null; setPlaying(false); }
      return;
    }
    if (hit !== null) { stop(); setActive(hit); return; }
    if (current !== null && current !== autoActive.current && !focusVisible()) setActive(null);
  };

  const open = React.useCallback((index: number) => {
    stop();
    setActive(index);
    const s = sim.current;
    s.v = 0;
    s.mode = RUN;
    live.current.open = true;
    paintBelt();
    setOpenIndex(index);
    live.current.onOpenChange?.(index);
  }, [stop, setActive, paintBelt]);

  const close = React.useCallback(() => {
    live.current.open = false;
    setOpenIndex(null);
    live.current.onOpenChange?.(null);
    kick();
  }, [kick]);

  const go = (index: number, focus: boolean) => {
    if (count === 0) return;
    const next = ((index % count) + count) % count;
    stop();
    if (focus) plates.current[next]?.focus({ preventScroll: true });
    setActive(next);
    seekTo(next);
  };

  /** Previous / next plate, staying inside the picked colour when one is picked. */
  const step = (dir: 1 | -1) => {
    const from = live.current.active ?? sim.current.center;
    if (filter === null) { go(from + dir, false); return; }
    for (let k = 1; k <= count; k++) {
      const i = (((from + dir * k) % count) + count) % count;
      if ((items[i].tier ?? 1) === filter) { go(i, false); return; }
    }
  };

  /** The colour board: picking a colour spotlights that category and brings its first plate to the front. Picking it again clears it. */
  const pickTier = (tier: number) => {
    if (filter === tier) { setFilter(null); return; }
    setFilter(tier);
    const first = items.findIndex((item) => (item.tier ?? 1) === tier);
    if (first >= 0) go(first, false);
  };

  const togglePause = () => {
    stop();
    const L = live.current;
    const next = !L.paused;
    if (!L.pausedControlled) { L.paused = next; setInnerPaused(next); }
    L.onPausedChange?.(next);
    if (!next && L.active !== null && !focusVisible() && !sim.current.inside) setActive(null);
    kick();
  };

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => { setPlaying(autoplay); }, [autoplay]);

  React.useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const measure = () => {
      const next = { section: Math.round(section.clientWidth), stage: Math.round(stage.clientWidth) };
      setSize((old) => (old.section === next.section && old.stage === next.stage ? old : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [count > 0]);

  React.useLayoutEffect(() => {
    const s = sim.current;
    if (!geo) return;
    if (!s.init) {
      s.init = true;
      s.offset = geo.s / 2 - Math.min(live.current.speed * 1.62, geo.pitch * 0.45);
      s.v = live.current.reduced || live.current.paused ? 0 : live.current.speed;
    } else if (s.l > 0 && s.l !== geo.l) {
      const f = geo.l / s.l;
      s.offset *= f;
      s.target *= f;
    }
    if (live.current.reduced) {
      s.v = 0;
      if (s.mode !== DRAG) s.mode = RUN;
      if (!s.touched) s.offset = geo.s / 2;
    }
    s.l = geo.l;
    s.z = [];
    s.lane = [];
    paintAll();
    kick();
  }, [geo, items, reduced, paintAll, kick]);

  React.useEffect(() => { kick(); }, [active, paused, openIndex, reduced, speed, kick]);

  React.useEffect(() => {
    const node = sectionRef.current;
    const s = sim.current;
    let inView = true;
    const update = () => {
      const visible = inView && !document.hidden;
      if (visible === s.visible) return;
      s.visible = visible;
      if (visible) kick();
      else if (s.raf) { cancelAnimationFrame(s.raf); s.raf = 0; s.last = 0; }
    };
    const observer = node && typeof IntersectionObserver === "function" ? new IntersectionObserver((entries) => { inView = entries.some((entry) => entry.isIntersecting); update(); }) : null;
    if (node && observer) observer.observe(node);
    document.addEventListener("visibilitychange", update);
    update();
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, [kick]);

  React.useEffect(() => () => { const s = sim.current; if (s.raf) cancelAnimationFrame(s.raf); s.raf = 0; s.last = 0; }, []);

  const geoReady = geo !== null;
  React.useEffect(() => {
    if (!playing || reduced || paused || openIndex !== null || count === 0 || !geoReady) return;
    let timer = 0;
    const show = () => {
      const g = live.current.geo;
      if (!g) return;
      const last = autoLast.current;
      const index = last === null ? centerOf(g, sim.current.offset + live.current.speed * 0.25) : (last + 1) % count;
      autoLast.current = index;
      autoActive.current = index;
      setActive(index);
      seekTo(index);
      timer = window.setTimeout(() => {
        if (autoActive.current === index) {
          autoActive.current = null;
          if (live.current.active === index) setActive(null);
        }
        timer = window.setTimeout(show, Math.max(300, interval - HOLD));
      }, HOLD);
    };
    timer = window.setTimeout(show, autoLast.current === null ? 1600 : Math.max(300, interval - HOLD));
    return () => window.clearTimeout(timer);
  }, [playing, reduced, paused, openIndex, count, interval, geoReady, setActive, seekTo]);

  React.useLayoutEffect(() => {
    if (openIndex !== null || lifted !== null || returnFocus.current === null) return;
    const index = returnFocus.current;
    returnFocus.current = null;
    plates.current[index]?.focus({ preventScroll: true });
  }, [openIndex, lifted]);

  const local = (event: React.PointerEvent) => {
    const box = stageRef.current?.getBoundingClientRect();
    return { x: event.clientX - (box?.left ?? 0), y: event.clientY - (box?.top ?? 0) };
  };

  const onPointerDown = (event: React.PointerEvent) => {
    const g = live.current.geo;
    if (event.button !== 0 || !g) return;
    const at = local(event);
    const hit = hitTest(at.x, at.y);
    pendingOpen.current = -1;
    pointer.current = { id: event.pointerId, index: hit ?? -1, x: event.clientX, y: event.clientY, moved: false, start: sim.current.offset, lane: at.y >= g.ym ? 1 : -1, lastX: event.clientX, lastT: event.timeStamp, v: 0 };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const s = sim.current;
    const p = pointer.current;
    const stage = stageRef.current;
    const g = live.current.geo;
    if (!stage || !g) return;
    const at = local(event);
    if (event.pointerType === "mouse") { s.px = at.x; s.py = at.y; s.inside = true; }
    if (p.id === event.pointerId) {
      const dx = event.clientX - p.x;
      const now = event.timeStamp;
      if (!p.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(event.clientY - p.y)) {
        p.moved = true;
        stop();
        setActive(null);
        s.mode = DRAG;
        if (stage.isConnected) stage.setPointerCapture(event.pointerId);
      }
      if (p.moved) {
        const v = (event.clientX - p.lastX) / Math.max(1, now - p.lastT);
        p.v = p.v * 0.6 + v * 0.4;
        p.lastX = event.clientX;
        p.lastT = now;
        const scale = p.lane > 0 ? 1 : 1 / g.kb;
        s.offset = p.start - p.lane * dx * scale;
        s.v = live.current.reduced ? 0 : -p.lane * p.v * 1000 * scale;
        kick();
      }
      return;
    }
    if (event.pointerType !== "mouse" || live.current.open) return;
    if (s.lock) {
      if (Math.hypot(at.x - s.lockX, at.y - s.lockY) < 4) return;
      s.lock = false;
    }
    hoverRef.current(hitTest(at.x, at.y));
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const s = sim.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };
    if (s.mode === DRAG) {
      s.mode = RUN;
      // Holding still before letting go bleeds the flick away (about 70 ms time constant).
      const carry = Math.exp(-Math.max(0, event.timeStamp - p.lastT) / 70);
      s.v = live.current.reduced ? 0 : clamp(s.v * carry, -1400, 1400);
      if (event.pointerType === "mouse") {
        const at = local(event);
        s.lock = true;
        s.lockX = at.x;
        s.lockY = at.y;
      }
      kick();
      return;
    }
    if (cancelled || p.moved) return;
    const touch = event.pointerType !== "mouse";
    if (p.index < 0) {
      if (touch && live.current.active !== null) { stop(); setActive(null); }
      return;
    }
    stop();
    if (touch && live.current.active !== p.index) setActive(p.index);
    else pendingOpen.current = p.index;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key) || count === 0) return;
    event.preventDefault();
    const own = (event.target as HTMLElement).closest("[data-dish]")?.getAttribute("data-dish");
    const from = own != null ? Number(own) : (active ?? center);
    go(event.key === "Home" ? 0 : event.key === "End" ? count - 1 : from + (event.key === "ArrowRight" ? 1 : -1), true);
  };

  const openSource = React.useCallback(() => (openIndex === null ? null : lifts.current[openIndex]?.getBoundingClientRect() ?? null), [openIndex]);
  const onLift = React.useCallback((on: boolean) => setLifted(on ? openIndex : null), [openIndex]);
  const onDialogClose = React.useCallback(() => { returnFocus.current = openIndex; close(); }, [openIndex, close]);
  const onDialogAdd = React.useCallback(() => {
    const item = openIndex === null ? undefined : items[openIndex];
    if (item) live.current.onAdd?.(item);
  }, [openIndex, items]);

  const paths = React.useMemo(() => (geo ? { outer: edgePath(geo, geo.band / 2), inner: edgePath(geo, -geo.band / 2), island: edgePath(geo, -geo.band / 2 - geo.d * 0.035) } : null), [geo]);
  const current = active === null ? null : items[active] ?? null;
  const roving = active ?? center;
  const tiers = legendEntries(items, legend);
  const g = geo;
  const control = "inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";

  const header = (eyebrow || heading || tiers.length > 0) && (
    <div className={wide ? "flex flex-col items-start gap-4 text-left" : "flex flex-col items-center gap-2 px-2 text-center"}>
      {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">{eyebrow}</p>}
      {heading && <h2 className={`text-balance font-medium tracking-tight ${wide ? "text-4xl leading-[1.1] xl:text-[2.75rem]" : "text-2xl md:text-3xl"}`}>{heading}</h2>}
      {tiers.length > 0 && (
        <div data-legend className={`mt-1 flex flex-col gap-2 ${wide ? "items-start" : "items-center"}`}>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Pick a plate colour</p>
          <ul className={`flex flex-wrap gap-1.5 ${wide ? "justify-start" : "justify-center"}`}>
            {tiers.map((entry) => {
              const on = filter === entry.tier;
              const n = items.filter((item) => (item.tier ?? 1) === entry.tier).length;
              return (
                <li key={entry.tier}>
                  <button
                    type="button"
                    data-filter={entry.tier}
                    aria-pressed={on}
                    onClick={() => pickTier(entry.tier)}
                    className={`inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-xs font-semibold outline-none transition-[background-color,border-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${on ? "border-foreground bg-foreground text-background shadow-md" : "border-border bg-card text-foreground/80 hover:border-foreground/40 hover:text-foreground"}`}
                  >
                    <img src={tierStyle(entry.tier).plate} alt="" aria-hidden="true" draggable={false} className="size-8 shrink-0 select-none drop-shadow-[0_2px_2px_rgb(0_0_0/0.25)]" />
                    {entry.label}
                    <span className={`tabular-nums font-normal ${on ? "text-background/70" : "text-muted-foreground"}`}>{n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );

  const captionNode = (
    <div id={`${uid}-caption`} aria-live="polite" data-caption className={`mx-auto overflow-hidden px-2 text-center ${wide ? "mt-3 h-[5.25rem] max-w-xl" : "mt-2 h-[5.75rem] max-w-md"}`}>
      <p className={`text-sm ${current ? "font-medium text-foreground" : "text-muted-foreground"}`}>
        {current ? <>{current.name} <span className="font-normal tabular-nums text-muted-foreground">· {current.price}</span></> : caption}
      </p>
      {current?.description && <p className="mt-0.5 line-clamp-3 text-[13px] leading-snug text-muted-foreground">{current.description}</p>}
    </div>
  );

  const controls = count > 1 && (
    <div className="relative z-10 mt-1 flex items-center justify-center gap-1.5">
      <button type="button" data-control="previous" aria-label={labels.previous} onClick={() => step(-1)} className={control}>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg>
      </button>
      <button type="button" data-control="pause" aria-label={labels.pause ?? DEFAULT_LABELS.pause} aria-pressed={paused} onClick={togglePause} className={control}>
        {paused
          ? <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="currentColor"><path d="M5 3.4v9.2a.6.6 0 0 0 .9.5l7.4-4.6a.6.6 0 0 0 0-1L5.9 2.9a.6.6 0 0 0-.9.5Z" /></svg>
          : <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="currentColor"><rect x="4" y="3" width="2.6" height="10" rx="0.8" /><rect x="9.4" y="3" width="2.6" height="10" rx="0.8" /></svg>}
      </button>
      <button type="button" data-control="next" aria-label={labels.next} onClick={() => step(1)} className={control}>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
      </button>
    </div>
  );

  const stage = count > 0 && (
    <div
      ref={stageRef}
      data-stage
      role="group"
      aria-label={heading ?? "Sushi conveyor belt"}
      aria-roledescription="conveyor belt"
      className="relative w-full touch-pan-y select-none"
      style={{ height: g ? g.height : 260, overflowX: "clip" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(event) => finishPointer(event, false)}
      onPointerCancel={(event) => finishPointer(event, true)}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        const s = sim.current;
        s.inside = false;
        s.lock = false;
        const current = live.current.active;
        if (pointer.current.id < 0 && !live.current.open && current !== null && current !== autoActive.current && !focusVisible()) setActive(null);
      }}
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null;
        if ((next && stageRef.current?.contains(next)) || live.current.open || sim.current.inside) return;
        const current = live.current.active;
        if (current !== null && current !== autoActive.current) setActive(null);
      }}
      onKeyDown={onKeyDown}
    >
      {g && (
        <div aria-hidden="true" data-counter className="pointer-events-none absolute inset-x-0" style={{ top: Math.max(0, g.edgeTop - g.d * 0.34), height: g.ym - Math.max(0, g.edgeTop - g.d * 0.34), background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-foreground) 5%, transparent) 40%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)", maskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)" }} />
      )}
      <div ref={beltRef} data-belt aria-hidden="true" className="pointer-events-none absolute inset-0">
        {g && paths && (
          <svg className="absolute left-0 top-0 overflow-visible" width={g.width} height={g.height} viewBox={`0 0 ${g.width} ${g.height}`} focusable="false">
            <defs>
              <filter id={`${uid}-soft`} x="-10%" y="-30%" width="120%" height="160%">
                <feGaussianBlur stdDeviation={(g.d * 0.06).toFixed(1)} />
              </filter>
              <linearGradient id={`${uid}-island`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--island)" }} />
                <stop offset="1" style={{ stopColor: "var(--island-low)" }} />
              </linearGradient>
            </defs>
            <path d={paths.outer} transform={`translate(0 ${(g.side + g.d * 0.07).toFixed(1)})`} fill="black" className="opacity-[0.18] dark:opacity-60" filter={`url(#${uid}-soft)`} />
            <path d={`${paths.outer}${paths.inner}`} fillRule="evenodd" transform={`translate(0 ${g.side.toFixed(1)})`} style={{ fill: "var(--belt-side)" }} />
            <path d={`${paths.outer}${paths.inner}`} fillRule="evenodd" style={{ fill: "var(--belt)" }} />
            <path ref={seamRef} fill="none" stroke="black" strokeOpacity={0.42} strokeWidth={Math.max(1, g.d * 0.013)} strokeLinecap="round" />
            <path ref={glintRef} fill="none" stroke="white" strokeOpacity={0.14} strokeWidth={Math.max(0.8, g.d * 0.009)} strokeLinecap="round" />
            <path d={paths.outer} fill="none" style={{ stroke: "var(--rail)" }} strokeWidth={Math.max(2, g.d * 0.026)} />
            <path d={paths.outer} fill="none" stroke="white" strokeOpacity={0.55} strokeWidth={Math.max(0.8, g.d * 0.008)} transform="translate(0 -0.8)" />
            <path d={paths.inner} fill="none" style={{ stroke: "var(--rail)" }} strokeWidth={Math.max(1.6, g.d * 0.02)} />
            <path d={paths.inner} fill="none" stroke="white" strokeOpacity={0.4} strokeWidth={Math.max(0.8, g.d * 0.008)} transform="translate(0 -0.7)" />
            <path d={paths.island} style={{ fill: "var(--island-wall)" }} />
            <path d={paths.island} transform={`translate(0 ${(-g.side * 0.6).toFixed(1)})`} style={{ fill: `url(#${uid}-island)` }} />
            <path d={paths.island} transform={`translate(0 ${(-g.side * 0.6 - 0.6).toFixed(1)})`} fill="none" stroke="white" strokeOpacity={0.55} strokeWidth={Math.max(0.8, g.d * 0.008)} className="dark:opacity-40" />
          </svg>
        )}
      </div>
      {g && items.map((item, i) => {
        const tier = tierStyle(item.tier);
        const isActive = active === i;
        const broken = !!failed[item.id];
        const mask = `url("${item.image}") 0 0 / 100% 100% no-repeat, ${PLATE_MASK}`;
        const dimmed = filter !== null && (item.tier ?? 1) !== filter;
        return (
          <button
            key={item.id}
            ref={(node) => { plates.current[i] = node; }}
            type="button"
            data-dish={i}
            data-active={isActive || undefined}
            tabIndex={i === roving ? 0 : -1}
            aria-label={`${item.name}, ${item.price}`}
            aria-describedby={`${uid}-caption`}
            aria-haspopup="dialog"
            aria-current={isActive || undefined}
            className="absolute left-0 top-0 cursor-pointer rounded-[50%] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            data-dimmed={dimmed || undefined}
            style={{ width: g.d, height: g.d * TILT, visibility: lifted === i ? "hidden" : undefined, opacity: dimmed && !isActive ? 0.28 : 1, filter: dimmed && !isActive ? "saturate(0.3)" : undefined, transition: "opacity 300ms, filter 300ms" }}
            onFocus={() => { if (pointer.current.id < 0) { stop(); setActive(i); } }}
            onClick={(event) => { const pending = pendingOpen.current; pendingOpen.current = -1; if (event.detail === 0 || pending === i) open(i); }}
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50 dark:opacity-90">
              <span ref={(node) => { shadows.current[i] = node; }} className="absolute inset-x-[5%] bottom-[-9%] top-[16%] rounded-[50%] bg-black" style={{ filter: `blur(${Math.max(2, g.d * 0.045).toFixed(1)}px)` }} />
            </span>
            <span ref={(node) => { lifts.current[i] = node; }} data-lift className="absolute inset-0">
              <PlatePaint src={tier.plate} />
              {!broken && (
                <img
                  src={item.image}
                  alt=""
                  draggable={false}
                  onError={() => setFailed((old) => (old[item.id] ? old : { ...old, [item.id]: true }))}
                  className="pointer-events-none absolute inset-0 size-full select-none object-fill"
                />
              )}
              {!broken && <span ref={(node) => { shades.current[i] = node; }} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: 0, WebkitMask: mask, mask }} />}
              {item.badge && <DishFlag text={item.badge} />}
              <span ref={(node) => { anchors.current[i] = node; }} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 size-0">
                <span data-chip className={`absolute bottom-[7px] left-0 flex w-max max-w-[min(22rem,86vw)] -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-card py-1 pl-2 pr-2.5 text-[11px] font-medium leading-none text-card-foreground shadow-[0_6px_16px_-6px_color-mix(in_oklab,var(--color-foreground)_40%,transparent)] transition-[opacity,translate] duration-300 motion-reduce:transition-none ${isActive && lifted !== i ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
                  <img src={tier.plate} alt="" aria-hidden="true" draggable={false} className="size-3.5 shrink-0 select-none" />
                  <span className="min-w-0 truncate">{item.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{item.price}</span>
                </span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <section
      {...rest}
      ref={setSectionRef}
      data-slot="sushi-conveyor-menu"
      data-layout={wide ? "wide" : "stack"}
      data-active={active ?? ""}
      data-open={openIndex ?? ""}
      data-paused={paused || undefined}
      data-center={center}
      className={`relative isolate w-full overflow-hidden bg-background text-foreground ${THEME} ${className ?? ""}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(64% 52% at 50% 56%, color-mix(in oklab, var(--color-foreground) 5%, transparent), transparent 72%)" }} />
      {wide ? (
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,24rem)_minmax(0,1fr)] items-center gap-12 px-10 py-14">
          <div className="flex flex-col items-start gap-6">
            {header}
            {action}
          </div>
          <div className="min-w-0">
            {stage}
            {controls}
            {captionNode}
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center px-4 pb-6 pt-6">
          {header}
          <div className="mt-2 w-full min-w-0">{stage}</div>
          {controls}
          {captionNode}
          {action && <div className="mt-3 flex justify-center">{action}</div>}
        </div>
      )}
      {openIndex !== null && items[openIndex] && (
        <DishDialog
          uid={uid}
          item={items[openIndex]}
          index={openIndex}
          total={count}
          labels={labels}
          reduced={reduced}
          broken={!!failed[items[openIndex].id]}
          source={openSource}
          category={legend?.[items[openIndex].tier ?? 1]}
          renderDescription={renderDescription}
          renderTitle={renderTitle}
          renderActions={renderActions}
          renderDetail={renderDetail}
          onLift={onLift}
          onAdd={onDialogAdd}
          onClose={onDialogClose}
        />
      )}
    </section>
  );
}

function DishDialog({ uid, item, index, total, labels, reduced, broken, source, category, renderDescription, renderTitle, renderActions, renderDetail, onLift, onAdd, onClose }: {
  renderTitle?: (item: ConveyorDish) => React.ReactNode;
  uid: string;
  category?: string;
  item: ConveyorDish;
  index: number;
  total: number;
  labels: SushiConveyorMenuLabels;
  reduced: boolean;
  broken: boolean;
  source: () => DOMRect | null;
  renderDescription?: (item: ConveyorDish) => React.ReactNode;
  renderActions?: (item: ConveyorDish) => React.ReactNode;
  renderDetail?: (detail: string, item: ConveyorDish) => React.ReactNode;
  onLift: (lifted: boolean) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  const dialogRef = React.useRef(null as HTMLDivElement | null);
  const figureRef = React.useRef(null as HTMLDivElement | null);
  const closeRef = React.useRef(null as HTMLButtonElement | null);
  const timer = React.useRef(0);
  const closing = React.useRef(false);
  const [shown, setShown] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  const titleId = `${uid}-dish-title`;
  const tier = tierStyle(item.tier);
  const description = renderDescription?.(item) ?? item.description;
  const actions = renderActions?.(item);

  React.useLayoutEffect(() => {
    const figure = figureRef.current;
    const from = source();
    closeRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    onLift(true);
    let animation = null as Animation | null;
    if (figure && from && !reduced && from.width > 0) {
      const to = figure.getBoundingClientRect();
      const sx = from.width / to.width;
      const sy = from.height / to.height;
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const rise = Math.min(120, Math.abs(dy) * 0.3 + 40);
      animation = figure.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transform: `translate(${dx * 0.42}px, ${dy * 0.42 - rise}px) scale(${((sx + 1) / 2) * 1.05}, ${((sy + 1) / 2) * 1.05}) rotate(${dx > 0 ? -6 : 6}deg)`, offset: 0.5 },
        { transform: "none" },
      ], { duration: 680, easing: "cubic-bezier(.22,.85,.3,1)" });
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => {
      cancelAnimationFrame(raf);
      animation?.cancel();
      window.clearTimeout(timer.current);
      document.body.style.overflow = overflow;
      onLift(false);
    };
  }, [source, reduced, onLift]);

  const dismiss = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    const figure = figureRef.current;
    const to = source();
    if (!figure || !to || reduced || to.width === 0) { onClose(); return; }
    const from = figure.getBoundingClientRect();
    const sx = to.width / from.width;
    const sy = to.height / from.height;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const animation = figure.animate([
      { transform: "none" },
      { transform: `translate(${dx * 0.58}px, ${dy * 0.58 - 36}px) scale(${(sx + 1) / 2}, ${(sy + 1) / 2})`, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
    ], { duration: 540, easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" });
    animation.onfinish = () => onClose();
  }, [source, reduced, onClose]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(event.target as Node)) return;
      if (event.key === "Escape") { event.preventDefault(); dismiss(); }
      else if (event.key === "Tab") {
        const first = dialog.querySelector("button");
        if (first) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); dismiss(); return; }
    if (event.key !== "Tab") return;
    const controls = [...(dialogRef.current?.querySelectorAll("button") ?? [])].filter((node) => !node.disabled);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const add = () => {
    if (added || closing.current) return;
    onAdd();
    setAdded(true);
    timer.current = window.setTimeout(dismiss, reduced ? 0 : 450);
  };

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} data-dish-dialog className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 text-foreground sm:p-8" onKeyDown={onKeyDown}>
      <div aria-hidden="true" className={`absolute inset-0 bg-background/80 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`} onClick={dismiss} />
      <div className="relative grid w-full max-w-[52rem] items-center gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] sm:gap-10 sm:p-8">
        <div aria-hidden="true" className={`absolute inset-0 rounded-[2rem] border border-border bg-card shadow-2xl transition-[opacity,scale] duration-300 motion-reduce:transition-none ${shown ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"}`} />
        <button ref={closeRef} type="button" onClick={dismiss} className={`absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-[opacity,color] duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}>
          {labels.close}
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /></svg>
        </button>
        <div ref={figureRef} data-dish-figure className="relative mx-auto aspect-square w-full max-w-[min(42vh,22rem)]">
          <span aria-hidden="true" className="absolute inset-x-[8%] bottom-[-4%] top-[14%] rounded-full bg-black opacity-25 blur-2xl dark:opacity-70" />
          <PlatePaint src={tier.plate} />
          {!broken && <img src={item.image} alt={item.name} draggable={false} className="relative size-full select-none object-contain" />}
          {item.badge && <DishFlag text={item.badge} />}
        </div>
        <div className={`relative flex flex-col gap-3 text-center transition-[opacity,translate] delay-150 duration-500 motion-reduce:transition-none sm:text-left ${shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <p className="flex items-center justify-center gap-2 font-mono text-[11px] tracking-[0.2em] text-muted-foreground sm:justify-start">
            <img src={tier.plate} alt="" aria-hidden="true" draggable={false} className="size-4 select-none" />
            {category && <span className="uppercase">{category} ·</span>}
            {pad(index + 1)} / {pad(total)}
          </p>
          <h3 id={titleId} className="text-2xl font-medium tracking-tight sm:text-3xl">{renderTitle?.(item) ?? item.name}</h3>
          {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
          {item.details && item.details.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {item.details.map((detail) => <li key={detail} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{renderDetail?.(detail, item) ?? detail}</li>)}
            </ul>
          )}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{item.price}</p>
            {actions != null ? actions : item.link ? (
              <a href={item.link.href} target="_blank" rel="noopener noreferrer" data-link className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm outline-none transition-[translate,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none">
                <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
                {item.link.label}
              </a>
            ) : (
            <button type="button" data-add onClick={add} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-sm outline-none transition-[translate,box-shadow] hover:-translate-y-px hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none">
              {added
                ? <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-7" /></svg>
                : <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 3.5v9M3.5 8h9" /></svg>}
              {labels.add}
            </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default SushiConveyorMenu;
