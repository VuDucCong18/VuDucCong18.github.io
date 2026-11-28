// Dish art for each plate: top-down drawings as transparent 640px webp, written to public/assets/dishes/<plate id>.webp.
// Run: npm run dishes (needs sharp). The plate rims underneath come from plates.mjs.
import sharp from "sharp";
import fs from "node:fs/promises";

const S = 640, C = S / 2;
const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

const DEFS = `
<defs>
 <radialGradient id="rim" cx="45%" cy="40%" r="62%"><stop offset="0" stop-color="#ffffff"/><stop offset=".8" stop-color="#f6f6f5"/><stop offset="1" stop-color="#dcdcdb"/></radialGradient>
 <radialGradient id="well" cx="48%" cy="44%" r="58%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f1f1f0"/></radialGradient>
 <radialGradient id="rice" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6e0d4"/></radialGradient>
 <pattern id="grain" width="14" height="12" patternUnits="userSpaceOnUse"><ellipse cx="4" cy="4" rx="3.4" ry="1.8" fill="#fff" transform="rotate(25 4 4)"/><ellipse cx="11" cy="9" rx="3.2" ry="1.7" fill="#dcd5c8" opacity=".8" transform="rotate(-30 11 9)"/></pattern>
 <radialGradient id="nori" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#3a4a3a"/><stop offset="1" stop-color="#121a14"/></radialGradient>
 <radialGradient id="bead" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#ffd2a1"/><stop offset=".45" stop-color="#ff7a1a"/><stop offset="1" stop-color="#c0400a"/></radialGradient>
 <radialGradient id="pod" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#a9d46a"/><stop offset="1" stop-color="#4f8a24"/></radialGradient>
 <pattern id="weave" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#c8a067"/><path d="M0 5h11M11 16h11" stroke="#a37d45" stroke-width="5"/><path d="M5 0v11M16 11v11" stroke="#dcbc85" stroke-width="5"/></pattern>
 <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#e2b33c"/><stop offset="1" stop-color="#fff0a8"/></linearGradient>
 <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000" flood-opacity=".3"/></filter>
</defs>`;

// Food only on a transparent square: the coloured plate underneath is drawn by the page, per category.
const plate = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${DEFS}
 <g filter="url(#sh)">${body}</g></svg>`;

const riceBed = (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#rice)"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#grain)"/>`;

/** A nigiri seen from above: rice bed, a draped slice of fish with grain lines, an optional extra on top. */
function nigiri(x, y, a, s, fish, line, extra = "") {
  const w = 230 * s, h = 112 * s;
  const lines = [-0.32, -0.1, 0.12, 0.34].map((f) => `<path d="M${f * w} ${-h * 0.56} q ${18 * s} ${h * 0.5} ${-6 * s} ${h * 1.05}" stroke="${line}" stroke-width="${8 * s}" fill="none" opacity=".55" stroke-linecap="round"/>`).join("");
  return `<g transform="translate(${x} ${y}) rotate(${a})">${riceBed(w * 0.92, h)}
   <path d="M${-w * 0.56} ${-h * 0.3} Q 0 ${-h * 0.82} ${w * 0.56} ${-h * 0.3} L ${w * 0.53} ${h * 0.28} Q 0 ${h * 0.62} ${-w * 0.53} ${h * 0.28} Z" fill="${fish}"/>
   ${lines}<path d="M${-w * 0.44} ${-h * 0.4} Q 0 ${-h * 0.72} ${w * 0.44} ${-h * 0.4}" stroke="#fff" stroke-width="${6 * s}" opacity=".4" fill="none"/>${extra}</g>`;
}

/** A gunkan (nori-wrapped cup) seen from above with a topping drawn inside. */
const gunkan = (x, y, r, inner) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="url(#nori)"/><circle r="${r - 3}" fill="none" stroke="#56705a" stroke-width="2" opacity=".6"/><circle r="${r - 12}" fill="url(#rice)"/>${inner(r - 12)}</g>`;
const beads = (r, grad = "url(#bead)", n = 26) => Array.from({ length: n }, (_, i) => { const t = i * 2.399, d = Math.sqrt((i + 0.5) / n) * (r - 11); return `<circle cx="${(Math.cos(t) * d).toFixed(1)}" cy="${(Math.sin(t) * d).toFixed(1)}" r="11" fill="${grad}"/><circle cx="${(Math.cos(t) * d - 3).toFixed(1)}" cy="${(Math.sin(t) * d - 4).toFixed(1)}" r="3" fill="#fff" opacity=".85"/>`; }).join("");

/** A California uramaki slice: rice outside dotted with tobiko, nori ring, crab/avocado/cucumber centre. */
const uramaki = (x, y, r, gold) => `<g transform="translate(${x} ${y})">
  <circle r="${r}" fill="url(#rice)"/><circle r="${r}" fill="url(#grain)"/>
  ${Array.from({ length: 34 }, (_, i) => { const t = i * 0.74, d = r - 6 - (i % 3) * 5; return `<circle cx="${(Math.cos(t) * d).toFixed(1)}" cy="${(Math.sin(t) * d).toFixed(1)}" r="3.6" fill="#ff7b22"/>`; }).join("")}
  <circle r="${r * 0.56}" fill="none" stroke="#18231a" stroke-width="5"/>
  <path d="M${-r * 0.32} ${-r * 0.1} h ${r * 0.42} v ${r * 0.2} h ${-r * 0.42} Z" fill="#fff" stroke="#e5483e" stroke-width="4"/>
  <circle cx="${r * 0.2}" cy="${r * 0.22}" r="${r * 0.17}" fill="#7fae3a"/><circle cx="${r * 0.2}" cy="${r * 0.22}" r="${r * 0.1}" fill="#b5d77a"/>
  <rect x="${-r * 0.3}" y="${r * 0.14}" width="${r * 0.2}" height="${r * 0.2}" rx="3" fill="#cfe6a0"/>
  ${gold ? `<path d="M${-r * 0.15} ${-r * 0.62} l 12 -6 l 9 10 l -7 9 l -12 -3 Z" fill="url(#gold)"/>` : ""}</g>`;

/** One dragon-roll piece seen from above: fanned avocado, eel sauce, sesame. */
const dragonPiece = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})">
  <ellipse rx="44" ry="50" fill="url(#rice)"/>
  ${[-26, -9, 8, 25].map((dx) => `<ellipse cx="${dx}" cy="0" rx="14" ry="48" fill="#8cbf45" stroke="#5f8f28" stroke-width="2"/><ellipse cx="${dx - 3}" cy="-8" rx="5" ry="30" fill="#c4e08a" opacity=".7"/>`).join("")}
  <path d="M-40 -18 L -20 8 L 0 -14 L 20 10 L 40 -12" stroke="#5a2e15" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  ${[[-28, 26], [6, 30], [26, -30], [-10, -34]].map(([a1, b]) => `<ellipse cx="${a1}" cy="${b}" rx="3" ry="2" fill="#fff8e0"/>`).join("")}</g>`;

/** An edamame pod: green, slightly curved, with three bean bumps. */
const pod = (x, y, a, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">
  <path d="M-46 0 C -40 -20, 40 -22, 48 -4 C 44 16, -40 18, -46 0 Z" fill="url(#pod)" stroke="#3d6e1b" stroke-width="2"/>
  ${[-26, 0, 26].map((dx) => `<ellipse cx="${dx}" cy="-2" rx="13" ry="11" fill="#9bcb58" opacity=".85"/><ellipse cx="${dx - 4}" cy="-6" rx="4" ry="3" fill="#e5f5c4" opacity=".8"/>`).join("")}
  <path d="M46 -4 q 10 -2 14 -10" stroke="#6b8f2f" stroke-width="4" fill="none" stroke-linecap="round"/></g>`;

/** A temari ball: rice ball with a round topping and a small garnish. */
const temari = (x, y, top, hi, garnish) => `<g transform="translate(${x} ${y})"><circle r="52" fill="url(#rice)"/><circle r="46" fill="${top}"/><ellipse cx="-14" cy="-16" rx="18" ry="11" fill="${hi}" opacity=".55"/>${garnish}</g>`;


/** Craggy tempura batter outline around an ellipse. */
const batter = (rx, ry, n = 44, amp = 7, seed = 1) => {
  let pts = "";
  for (let i = 0; i <= n; i++) { const t = (i / n) * Math.PI * 2; const k = 1 + (Math.sin(i * 2.7 + seed) * 0.5 + Math.sin(i * 5.3 + seed * 3) * 0.5) * amp / Math.min(rx, ry); pts += `${i ? "L" : "M"}${(Math.cos(t) * rx * k).toFixed(1)} ${(Math.sin(t) * ry * k).toFixed(1)}`; }
  return pts + "Z";
};
const crumbs = (rx, ry, n, seed) => Array.from({ length: n }, (_, i) => { const t = i * 2.399 + seed, d = Math.sqrt((i + 0.5) / n); return `<circle cx="${(Math.cos(t) * rx * d * 0.9).toFixed(1)}" cy="${(Math.sin(t) * ry * d * 0.85).toFixed(1)}" r="${(3 + (i % 4)).toFixed(1)}" fill="${i % 3 ? "#f7cf6a" : "#fde6a6"}" opacity=".9"/>`; }).join("");

/** Ebi tempura: a golden battered shrimp with a red tail. */
const ebiTempura = (x, y, a, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">
  <path d="${batter(120, 40, 50, 8, a)}" fill="#e3a43a"/><path d="${batter(112, 33, 44, 6, a + 2)}" fill="#f2c25a"/>${crumbs(105, 30, 34, a)}
  <path d="M118 -4 l 38 -24 l 10 26 l -10 26 l -38 -18 Z" fill="#e8442f"/><path d="M124 -2 l 30 -14 M124 2 l 30 14" stroke="#ff8a6a" stroke-width="3"/></g>`;

/** Unagi (grilled eel) nigiri: glossy brown slice with grill marks, sauce sheen, sesame, nori belt. */
const unagi = (x, y, a, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">${riceBed(212, 112)}
  <path d="M-124 -34 Q 0 -86 124 -34 L 120 34 Q 0 70 -120 34 Z" fill="#7a3f17"/>
  <path d="M-110 -30 Q 0 -72 110 -30 L 106 24 Q 0 56 -106 24 Z" fill="#a85a22"/>
  ${[-80, -40, 0, 40, 80].map((xx) => `<path d="M${xx - 12} -48 l 22 86" stroke="#4a230b" stroke-width="7" opacity=".55" stroke-linecap="round"/>`).join("")}
  <path d="M-96 -36 Q 0 -66 96 -36" stroke="#ffd9a8" stroke-width="7" opacity=".45" fill="none"/>
  <rect x="-16" y="-70" width="32" height="140" rx="3" fill="url(#nori)"/>
  ${[[-70, -6], [-50, 14], [44, -12], [70, 10], [60, 22], [-30, -24]].map(([a1, b]) => `<ellipse cx="${a1}" cy="${b}" rx="3.6" ry="2.2" fill="#fff4d6"/>`).join("")}</g>`;

/** Hosomaki with an avocado centre (nori outside). */
const avoMaki = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="url(#nori)"/><circle r="${r - 7}" fill="url(#rice)"/><circle r="${r - 7}" fill="url(#grain)"/>
  <path d="M${-r * 0.32} ${r * 0.18} Q 0 ${-r * 0.5} ${r * 0.32} ${r * 0.18} Q 0 ${r * 0.36} ${-r * 0.32} ${r * 0.18} Z" fill="#6d9b2c"/><path d="M${-r * 0.24} ${r * 0.12} Q 0 ${-r * 0.36} ${r * 0.24} ${r * 0.12} Q 0 ${r * 0.24} ${-r * 0.24} ${r * 0.12} Z" fill="#c2df84"/></g>`;

/** Salmon–avocado uramaki: rice outside with sesame, nori ring, salmon + avocado inside. */
const salmonAvo = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="url(#rice)"/><circle r="${r}" fill="url(#grain)"/>
  ${Array.from({ length: 26 }, (_, i) => { const t = i * 0.97, d = r - 8 - (i % 3) * 6; return `<ellipse cx="${(Math.cos(t) * d).toFixed(1)}" cy="${(Math.sin(t) * d).toFixed(1)}" rx="3.4" ry="2" fill="${i % 4 ? "#f6eedc" : "#2a2a2a"}" transform="rotate(${i * 40} ${(Math.cos(t) * d).toFixed(1)} ${(Math.sin(t) * d).toFixed(1)})"/>`; }).join("")}
  <circle r="${r * 0.56}" fill="none" stroke="#18231a" stroke-width="5"/>
  <path d="M${-r * 0.36} ${-r * 0.06} Q ${-r * 0.1} ${-r * 0.42} ${r * 0.14} ${-r * 0.1} Z" fill="#f4844f"/><path d="M${-r * 0.3} ${-r * 0.1} l ${r * 0.3} ${-r * 0.16}" stroke="#ffe3cf" stroke-width="3"/>
  <ellipse cx="${r * 0.12}" cy="${r * 0.18}" rx="${r * 0.22}" ry="${r * 0.14}" fill="#7fae3a"/><ellipse cx="${r * 0.12}" cy="${r * 0.16}" rx="${r * 0.13}" ry="${r * 0.08}" fill="#c2df84"/></g>`;

/** Crunchy tempura roll slice: uramaki covered in golden crumbs, spicy mayo, shrimp tail. */
const crunchRoll = (x, y, r, tail) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#e9b04c"/>${crumbs(r, r, 30, x)}
  <circle r="${r * 0.6}" fill="url(#rice)"/><circle r="${r * 0.44}" fill="none" stroke="#18231a" stroke-width="4"/>
  <ellipse cx="${-r * 0.08}" cy="0" rx="${r * 0.22}" ry="${r * 0.15}" fill="#f2c25a"/><ellipse cx="${-r * 0.08}" cy="0" rx="${r * 0.12}" ry="${r * 0.08}" fill="#ff9a7a"/>
  <ellipse cx="${r * 0.2}" cy="${r * 0.12}" rx="${r * 0.1}" ry="${r * 0.08}" fill="#8cbf45"/>
  <path d="M${-r * 0.7} ${-r * 0.2} q ${r * 0.35} ${-r * 0.35} ${r * 0.7} 0 t ${r * 0.7} 0" stroke="#ff7b3a" stroke-width="7" fill="none" stroke-linecap="round"/>
  ${tail ? `<path d="M${r * 0.75} ${-r * 0.2} l ${r * 0.5} ${-r * 0.35} l ${r * 0.1} ${r * 0.4} Z" fill="#e8442f"/>` : ""}</g>`;

/** Caterpillar roll piece: avocado-topped eel roll with eel sauce. */
const caterpillarPiece = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><ellipse rx="46" ry="52" fill="url(#rice)"/>
  ${[-28, -10, 8, 26].map((dx) => `<ellipse cx="${dx}" cy="0" rx="15" ry="50" fill="#7fae3a" stroke="#567f23" stroke-width="2"/><ellipse cx="${dx - 4}" cy="-6" rx="6" ry="32" fill="#c8e38f" opacity=".75"/>`).join("")}
  <path d="M-42 -6 Q -22 -26 0 -6 T 42 -6" stroke="#4e260c" stroke-width="8" fill="none" stroke-linecap="round"/>
  ${[[-26, 24], [10, 28], [28, -26]].map(([a1, b]) => `<ellipse cx="${a1}" cy="${b}" rx="3" ry="2" fill="#fff4d6"/>`).join("")}</g>`;

/** Vegetable tempura pieces. */
const sweetPotato = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="${batter(66, 46, 36, 6, a)}" fill="#e3a43a"/><ellipse rx="54" ry="36" fill="#7a3f7a"/><ellipse rx="46" ry="29" fill="#f6c94b"/>${crumbs(50, 32, 10, a)}</g>`;
const shisoTempura = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="${batter(80, 52, 40, 8, a)}" fill="#e9b04c" opacity=".85"/><path d="M-70 0 C -40 -50, 40 -50, 74 0 C 40 50, -40 50, -70 0 Z" fill="#3f8a3a"/><path d="M-66 0 L 70 0" stroke="#2c6b28" stroke-width="4"/>${[-40, -10, 20, 48].map((xx) => `<path d="M${xx} 0 l 16 -26 M${xx} 0 l 16 26" stroke="#2c6b28" stroke-width="2.5"/>`).join("")}${crumbs(70, 40, 14, a + 9)}</g>`;
const pumpkin = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><path d="${batter(62, 40, 34, 6, a)}" fill="#e3a43a"/><path d="M-56 18 Q 0 -60 56 18 Z" fill="#f0902a"/><path d="M-56 18 Q 0 -50 56 18" stroke="#2f5a22" stroke-width="7" fill="none"/>${crumbs(48, 22, 8, a)}</g>`;

/** California roll piece (template-style): rounded square crusted in tobiko, rice, nori square, crab + avocado wedge + cucumber cubes. */
const californiaPiece = (x, y, a, z = 170, seed = 1) => {
  const h = z / 2; let r = seed * 9301 + 49297; const R = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const roe = Array.from({ length: 230 }, () => { const side = Math.floor(R() * 4), t = R() * z - h, d = h - R() * 17;
    const [cx, cy] = side === 0 ? [t, -d] : side === 1 ? [d, t] : side === 2 ? [t, d] : [-d, t];
    const c = ["#ff7a1a", "#ff8f2e", "#f0610c", "#ffa24a"][Math.floor(R() * 4)];
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(3.2 + R() * 1.6).toFixed(1)}" fill="${c}"/>`; }).join("");
  const riceRoe = Array.from({ length: 34 }, () => `<circle cx="${((R() - 0.5) * (z - 44)).toFixed(1)}" cy="${((R() - 0.5) * (z - 44)).toFixed(1)}" r="3" fill="#ff8a2a"/>`).join("");
  const cubes = [[-26, -22], [-30, 2], [24, 22], [6, 30], [30, -2]].map(([cx, cy]) => `<rect x="${cx - 8}" y="${cy - 8}" width="16" height="16" rx="3" fill="#c9e3a0" stroke="#7fa84a" stroke-width="2.4"/>`).join("");
  return `<g transform="translate(${x} ${y}) rotate(${a})">
    <rect x="${-h}" y="${-h}" width="${z}" height="${z}" rx="${z * 0.2}" fill="#e85a0c"/>${roe}
    <rect x="${-h + 18}" y="${-h + 18}" width="${z - 36}" height="${z - 36}" rx="${z * 0.14}" fill="url(#rice)"/><rect x="${-h + 18}" y="${-h + 18}" width="${z - 36}" height="${z - 36}" rx="${z * 0.14}" fill="url(#grain)"/>${riceRoe}
    <rect x="${-h + 40}" y="${-h + 40}" width="${z - 80}" height="${z - 80}" rx="${z * 0.08}" fill="#141c16"/>
    <rect x="${-h + 45}" y="${-h + 45}" width="${z - 90}" height="${z - 90}" rx="${z * 0.06}" fill="#f7f5f1"/>
    <g transform="scale(1.22)">${cubes}
    <path d="M-30 6 C -24 -6, 10 -4, 16 12 C 12 34, -22 36, -30 6 Z" fill="#fbfaf7"/>
    ${[[-24, 10, 14], [-14, 20, 16], [-4, 8, 14], [2, 22, 10]].map(([sx, sy, l]) => `<path d="M${sx} ${sy} l ${l} -6" stroke="#e8454a" stroke-width="3.5" stroke-linecap="round"/>`).join("")}
    <path d="M-2 -34 L 36 -34 L 36 6 Z" fill="#a8c94e"/><path d="M4 -34 L 36 -34 L 36 -2 Z" fill="#cfe58a"/><path d="M-2 -34 L 36 6" stroke="#6f8f2a" stroke-width="3"/></g></g>`;
};

/** Kappa maki (cucumber hosomaki): nori outside, rice, a cucumber stick with skin and seeds. */
const kappaMaki = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="url(#nori)"/><circle r="${r - 7}" fill="url(#rice)"/><circle r="${r - 7}" fill="url(#grain)"/>
  <rect x="${-r * 0.3}" y="${-r * 0.22}" width="${r * 0.6}" height="${r * 0.44}" rx="${r * 0.08}" fill="#2f6b26"/>
  <rect x="${-r * 0.25}" y="${-r * 0.16}" width="${r * 0.5}" height="${r * 0.32}" rx="${r * 0.06}" fill="#cfe8a4"/>
  ${[-0.12, 0, 0.12].map((f) => `<ellipse cx="${(f * r).toFixed(1)}" cy="0" rx="${(r * 0.035).toFixed(1)}" ry="${(r * 0.06).toFixed(1)}" fill="#f4fbe6"/>`).join("")}</g>`;

/** Chawanmushi seen from above: glazed cup on a saucer, smooth egg custard, shrimp, kamaboko, ginkgo, mitsuba. */
const chawanmushi = () => `
  <ellipse cx="${C}" cy="${C + 8}" rx="210" ry="206" fill="#2b3a55"/><circle cx="${C}" cy="${C}" r="206" fill="#33456a"/><circle cx="${C}" cy="${C}" r="206" fill="none" stroke="#6e82a8" stroke-width="3" opacity=".6"/>
  <circle cx="${C}" cy="${C}" r="150" fill="#f4efe4"/><circle cx="${C}" cy="${C}" r="150" fill="none" stroke="#21304d" stroke-width="16"/>
  <circle cx="${C}" cy="${C}" r="134" fill="#f6dc8a"/><radialGradient id="custard" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#efcd6c"/></radialGradient><circle cx="${C}" cy="${C}" r="130" fill="url(#custard)"/>
  <ellipse cx="${C - 40}" cy="${C - 52}" rx="56" ry="22" fill="#fffbe8" opacity=".55" transform="rotate(-20 ${C - 40} ${C - 52})"/>
  <g transform="translate(${C + 36} ${C + 30}) rotate(-20)"><path d="M-42 0 C -40 -30, 30 -34, 40 -6 C 30 6, 0 8, -10 2 C -20 20, -40 18, -42 0 Z" fill="#ffb59c"/>${[-24, -8, 8, 22].map((dx) => `<path d="M${dx} -24 q 6 12 0 24" stroke="#ff6a48" stroke-width="5" fill="none"/>`).join("")}<path d="M40 -6 l 16 -12 l 2 18 Z" fill="#ff5a36"/></g>
  <g transform="translate(${C - 58} ${C + 40})"><circle r="30" fill="#fff"/><path d="M0 0 m -18 0 a 18 18 0 1 1 18 18 a 12 12 0 1 1 -10 -12 a 6 6 0 1 1 6 6" stroke="#ef6f8f" stroke-width="5" fill="none"/></g>
  <g transform="translate(${C + 10} ${C - 60})"><ellipse rx="16" ry="20" fill="#e9c93a"/><ellipse cx="-4" cy="-5" rx="6" ry="8" fill="#fff1a0"/></g>
  <g transform="translate(${C - 22} ${C - 10}) rotate(-10)">${[0, 120, 240].map((r) => `<ellipse cx="0" cy="-20" rx="15" ry="20" fill="#5aa13a" transform="rotate(${r})"/><path d="M0 0 L 0 -34" stroke="#3d7a22" stroke-width="2" transform="rotate(${r})"/>`).join("")}<path d="M0 0 q 26 22 52 28" stroke="#6fae4a" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;

/** Mini kitsune udon: bowl, amber broth, thick udon noodles, two pieces of fried tofu skin (aburaage), spring onion. */
const kitsuneUdon = () => {
  let r = 4242; const R = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const pt = (rad) => { const t = R() * 6.283, d = Math.sqrt(R()) * rad; return [Math.cos(t) * d, Math.sin(t) * d]; };
  const noodles = Array.from({ length: 46 }, () => { const [a1, b1] = pt(160), [a2, b2] = pt(185), [a3, b3] = pt(185), [a4, b4] = pt(160);
    const d = `M${a1.toFixed(0)} ${b1.toFixed(0)} C ${a2.toFixed(0)} ${b2.toFixed(0)}, ${a3.toFixed(0)} ${b3.toFixed(0)}, ${a4.toFixed(0)} ${b4.toFixed(0)}`;
    return `<path d="${d}" stroke="#d9c79e" stroke-width="19" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fbf6e6" stroke-width="15" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fffdf8" stroke-width="4" fill="none" opacity=".8" stroke-linecap="round" transform="translate(-2 -3)"/>`; }).join("");
  const age = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-62" y="-44" width="124" height="88" rx="16" fill="#c9862e"/><rect x="-56" y="-38" width="112" height="76" rx="13" fill="#e0a548"/>
    ${Array.from({ length: 26 }, () => `<circle cx="${((R() - 0.5) * 100).toFixed(1)}" cy="${((R() - 0.5) * 64).toFixed(1)}" r="${(2 + R() * 3).toFixed(1)}" fill="#b87526" opacity=".55"/>`).join("")}
    <path d="M-50 -30 Q 0 -40 50 -30" stroke="#f3c977" stroke-width="5" fill="none" opacity=".8"/></g>`;
  const onion = Array.from({ length: 16 }, () => { const x = C - 70 + R() * 150, y = C - 20 + R() * 120; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#9ccc5a" stroke="#4f8a24" stroke-width="3"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="#dff0bf"/>`; }).join("");
  return `
  <circle cx="${C}" cy="${C + 8}" r="214" fill="#1b1b1d"/><circle cx="${C}" cy="${C}" r="212" fill="#2a2426"/><circle cx="${C}" cy="${C}" r="212" fill="none" stroke="#8e2f25" stroke-width="10"/>
  <circle cx="${C}" cy="${C}" r="186" fill="#d9a85c"/><radialGradient id="broth" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f3cf8c"/><stop offset="1" stop-color="#c98d3c"/></radialGradient><circle cx="${C}" cy="${C}" r="182" fill="url(#broth)"/>
  <clipPath id="bowl"><circle cx="${C}" cy="${C}" r="176"/></clipPath>
  <g clip-path="url(#bowl)"><g transform="translate(${C} ${C + 4})">${noodles}</g></g>
  ${age(C - 52, C - 62, -14)}${age(C + 58, C - 20, 18)}
  <g transform="translate(${C - 84} ${C + 70})"><circle r="34" fill="#fff" stroke="#f2d7de" stroke-width="2"/><path d="M0 0 m -18 0 a 18 18 0 1 1 18 18 a 12 12 0 1 1 -10 -12 a 6 6 0 1 1 6 6" stroke="#ef6f8f" stroke-width="5" fill="none"/></g>
  ${onion}`;
};

/** Hotate (scallop) nigiri: thick cream slab with fibre texture, lightly torched top, tobiko and chive garnish. */
const hotate = (x, y, a, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">${riceBed(212, 112)}
  <path d="M-118 -30 Q 0 -86 118 -30 L 114 30 Q 0 66 -114 30 Z" fill="#f6ecdc"/>
  ${Array.from({ length: 16 }, (_, i) => `<path d="M${-104 + i * 14} -40 q 6 40 0 76" stroke="#e6d6bd" stroke-width="3" fill="none" opacity=".8"/>`).join("")}
  <path d="M-80 -30 Q 0 -66 80 -30 L 76 18 Q 0 40 -76 18 Z" fill="#e8b76a" opacity=".55"/><path d="M-50 -24 Q 0 -46 50 -24" stroke="#c98a3a" stroke-width="6" opacity=".45" fill="none"/>
  <path d="M-96 -36 Q 0 -70 96 -36" stroke="#fff" stroke-width="6" opacity=".55" fill="none"/>
  ${Array.from({ length: 9 }, (_, i) => `<circle cx="${(-10 + (i % 3) * 9).toFixed(0)}" cy="${(-8 + Math.floor(i / 3) * 8).toFixed(0)}" r="4" fill="#ff7a1a"/>`).join("")}
  <path d="M24 -10 l 30 -8 M26 -2 l 30 -2" stroke="#3f8a3a" stroke-width="4" stroke-linecap="round"/></g>`;

/** Unagi nigiri, clean flat style (option B): glazed eel with grill stripes, nori band, a few spring-onion rings and sesame. */
const unagiB = (x, y, a, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">
  <rect x="-118" y="-52" width="236" height="112" rx="56" fill="url(#rice)"/><rect x="-118" y="-52" width="236" height="112" rx="56" fill="url(#grain)"/>
  <path d="M-136 -26 Q 0 -90 136 -26 L 132 32 Q 0 70 -132 32 Z" fill="#8f3f14"/>
  <path d="M-124 -26 Q 0 -78 124 -26 L 120 20 Q 0 52 -120 20 Z" fill="#b5581e"/>
  ${[-84, -42, 42, 84].map((xx) => `<path d="M${xx - 6} -36 l 10 60" stroke="#7a3110" stroke-width="7" opacity=".5" stroke-linecap="round"/>`).join("")}
  <path d="M-104 -34 Q 0 -70 104 -34" stroke="#f3b77a" stroke-width="7" opacity=".55" fill="none" stroke-linecap="round"/>
  <rect x="-20" y="-64" width="40" height="128" rx="4" fill="url(#nori)"/>
  ${[[-62, -14], [62, -18], [-30, 8]].map(([sx, sy]) => `<circle cx="${sx}" cy="${sy}" r="6" fill="none" stroke="#4f8f2e" stroke-width="3"/>`).join("")}
  ${[[-92, -4], [-80, 10], [86, 0], [98, -12]].map(([sx, sy], i) => `<ellipse cx="${sx}" cy="${sy}" rx="3.6" ry="2.2" fill="#fff4d6" transform="rotate(${i * 40} ${sx} ${sy})"/>`).join("")}</g>`;

/** Tuna (akami) nigiri, clean flat style: deep even red, faint grain kept inside the slice, a soft sheen. */
const tunaNigiri = (x, y, a, s = 1) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">
  <rect x="-118" y="-52" width="236" height="112" rx="56" fill="url(#rice)"/><rect x="-118" y="-52" width="236" height="112" rx="56" fill="url(#grain)"/>
  <path d="M-136 -26 Q 0 -90 136 -26 L 132 32 Q 0 70 -132 32 Z" fill="#9e1626"/>
  <path d="M-124 -26 Q 0 -78 124 -26 L 120 20 Q 0 52 -120 20 Z" fill="#c8243a"/>
  ${[-80, -44, -8, 28, 64, 98].map((xx) => `<path d="M${xx - 6} -34 q 12 26 4 54" stroke="#a71a2d" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>`).join("")}
  <path d="M-104 -34 Q 0 -70 104 -34" stroke="#ff8a96" stroke-width="7" opacity=".5" fill="none" stroke-linecap="round"/>
  <ellipse cx="-30" cy="-18" rx="40" ry="7" fill="#ffc7cd" opacity=".35"/></g>`;

/** Clear plastic dome lid seen from above: faint tint, bright rim, a soft crescent of glare, a few glints and the small centre knob. */
const clearLid = (r) => `<g>
  <circle cx="${C}" cy="${C}" r="${r}" fill="#e6f1f7" fill-opacity=".16"/>
  <circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="6"/>
  <circle cx="${C}" cy="${C}" r="${r - 9}" fill="none" stroke="#cfe2ec" stroke-opacity=".6" stroke-width="2"/>
  <circle cx="${C}" cy="${C}" r="${r - 40}" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3"/>
  <path d="M ${C - r * 0.78} ${C - r * 0.1} A ${r * 0.8} ${r * 0.8} 0 0 1 ${C + r * 0.12} ${C - r * 0.78}" stroke="#fff" stroke-opacity=".55" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M ${C + r * 0.62} ${C + r * 0.42} A ${r * 0.76} ${r * 0.76} 0 0 1 ${C + r * 0.3} ${C + r * 0.68}" stroke="#fff" stroke-opacity=".4" stroke-width="8" fill="none" stroke-linecap="round"/>
  <circle cx="${C - r * 0.42}" cy="${C - r * 0.5}" r="7" fill="#fff" fill-opacity=".9"/>
  <circle cx="${C}" cy="${C}" r="30" fill="#fff" fill-opacity=".18" stroke="#fff" stroke-opacity=".75" stroke-width="3"/>
  <circle cx="${C - 8}" cy="${C - 9}" r="6" fill="#fff" fill-opacity=".8"/>
</g>`;


// Insurance: a soft-shell crab hand roll (temaki) lying across the plate: a textured nori cone, rice at the open end,
// crispy golden soft-shell crab with legs spilling out, cucumber sticks, Japanese mayo and eel-sauce drizzle, sesame.
const softShellHandRoll = () => {
  let seed = 23;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const f = (n) => n.toFixed(1);
  const L = 262, W = 98; // cone length along the axis, half-width at the open end
  const defs = `<defs>
    <linearGradient id="hrNori" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3a2f"/><stop offset=".5" stop-color="#1a241d"/><stop offset="1" stop-color="#121914"/></linearGradient>
    <radialGradient id="hrFry" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f2b257"/><stop offset=".6" stop-color="#cf7f2c"/><stop offset="1" stop-color="#8f4c17"/></radialGradient>
    <linearGradient id="hrCuc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d5ecb8"/><stop offset=".6" stop-color="#9ccb74"/><stop offset="1" stop-color="#2f6b2a"/></linearGradient>
    <radialGradient id="hrRice" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ece7dc"/></radialGradient>
    <clipPath id="hrCone"><path d="M0 0 L${L} ${-W} Q ${L + 24} 0 ${L} ${W} Z"/></clipPath>
  </defs>`;
  let g = `<g transform="translate(${C - 150} ${C + 128}) rotate(-42)">`;
  // nori cone with a seaweed texture and the wrap's overlapping edge
  g += `<path d="M0 0 L${L} ${-W} Q ${L + 24} 0 ${L} ${W} Z" fill="url(#hrNori)" stroke="#0d130f" stroke-width="2"/>`;
  g += `<g clip-path="url(#hrCone)">`;
  for (let i = 0; i < 170; i++) {
    const x = rand() * L, y = (rand() - 0.5) * 2 * W * (x / L);
    g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(2 + rand() * 6)}" ry="${f(0.8 + rand() * 1.2)}" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})" fill="${rand() < 0.5 ? "#3f5243" : "#0e1510"}" opacity=".7"/>`;
  }
  g += `<path d="M20 4 L${L - 10} ${W * 0.62}" stroke="#4a5d4d" stroke-width="3" opacity=".8"/>`;
  g += `<path d="M30 -6 L${L - 30} ${-W * 0.55}" stroke="#0b100c" stroke-width="2" opacity=".6"/>`;
  g += `</g>`;
  // the open end: rice mound
  g += `<ellipse cx="${L + 6}" cy="0" rx="30" ry="${W - 8}" fill="url(#hrRice)" stroke="#ddd5c6" stroke-width="1.5"/>`;
  for (let i = 0; i < 55; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()), x = L + 6 + Math.cos(a) * 26 * d, y = Math.sin(a) * (W - 12) * d;
    g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="4.6" ry="2.3" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})" fill="#fff" stroke="#e0d8c9" stroke-width=".7"/>`;
  }
  // cucumber sticks fanning out of the top of the cone
  for (const [y, a, len] of [[-62, -14, 118], [-42, -6, 132], [-74, -24, 96]]) {
    g += `<g transform="translate(${L - 6} ${y}) rotate(${a})"><rect x="0" y="-8" width="${len}" height="16" rx="4" fill="url(#hrCuc)" stroke="#2c5e27" stroke-width="1.3"/><rect x="0" y="4" width="${len}" height="4" rx="2" fill="#2f6b2a"/><path d="M8 -2 H ${len - 8}" stroke="#eef7e2" stroke-width="1.5" stroke-dasharray="3 5" opacity=".8"/></g>`;
  }
  // crispy soft-shell crab: craggy battered body, jointed legs bent at the knee, one small claw
  const craggy = (cx, cy, rx, ry, n, jit) => {
    const pts = Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2, j = 1 + (rand() - 0.5) * jit; return [cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]; });
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]);
    let d = `M${f(m0[0])} ${f(m0[1])}`;
    for (let k = 0; k < n; k++) { const m = mid(pts[k], pts[(k + 1) % n]); d += ` Q${f(pts[k][0])} ${f(pts[k][1])} ${f(m[0])} ${f(m[1])}`; }
    return d + "Z";
  };
  const bx = L + 30, by = -2, brx = 58, bry = 76;
  /** A battered leg: a tapering, slightly curved shape with a bumpy outline, pointing out from the body. */
  const leg = (theta, bend, len, w0) => {
    const t = (theta * Math.PI) / 180;
    const sx = bx + Math.cos(t) * brx * 0.75, sy = by + Math.sin(t) * bry * 0.75;
    const pts = [];
    for (let k = 0; k <= 10; k++) {
      const u = k / 10, ang = t + ((bend * Math.PI) / 180) * u * u;
      const px = sx + Math.cos(t) * len * u * 0.6 + Math.cos(ang) * len * u * 0.4, py = sy + Math.sin(t) * len * u * 0.6 + Math.sin(ang) * len * u * 0.4;
      pts.push([px, py, ang, w0 * (1 - u * 0.65)]);
    }
    const side = (sgn) => pts.map(([px, py, ang, w]) => { const j = w * (0.85 + rand() * 0.35); return [px - Math.sin(ang) * j * sgn, py + Math.cos(ang) * j * sgn]; });
    const left = side(1), right = side(-1).reverse();
    const tip = pts[pts.length - 1];
    const ring = [...left, [tip[0] + Math.cos(tip[2]) * tip[3] * 1.2, tip[1] + Math.sin(tip[2]) * tip[3] * 1.2], ...right];
    let d = `M${f(ring[0][0])} ${f(ring[0][1])}`;
    for (let k = 1; k < ring.length; k++) { const m = [(ring[k - 1][0] + ring[k][0]) / 2, (ring[k - 1][1] + ring[k][1]) / 2]; d += ` Q${f(ring[k - 1][0])} ${f(ring[k - 1][1])} ${f(m[0])} ${f(m[1])}`; }
    d += "Z";
    let out = `<path d="${d}" fill="url(#hrFry)" stroke="#7a3d10" stroke-width="1.6" stroke-linejoin="round"/>`;
    for (let k = 0; k < 9; k++) { const q = pts[1 + Math.floor(rand() * 9)]; out += `<path d="${craggy(q[0] + (rand() - 0.5) * q[3], q[1] + (rand() - 0.5) * q[3], 2 + rand() * 2.5, 1.6 + rand() * 2, 5, 0.6)}" fill="${rand() < 0.6 ? "#ffd48a" : "#a85d1d"}"/>`; }
    return out;
  };
  for (const [theta, bend, len, w] of [[-62, 30, 64, 11], [-24, 22, 74, 12], [22, -24, 72, 12], [60, -32, 58, 10]]) g += leg(theta, bend, len, w);
  // the battered body: a craggy outline, darker crevices and crisp golden flecks
  const body = craggy(bx, by, brx, bry, 28, 0.3);
  g += `<path d="${body}" fill="#7a3d10" transform="translate(2 3)" opacity=".5"/>`;
  g += `<path d="${body}" fill="url(#hrFry)" stroke="#7a3d10" stroke-width="2"/>`;
  for (let i = 0; i < 16; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * 0.8;
    g += `<path d="${craggy(bx + Math.cos(a) * brx * d, by + Math.sin(a) * bry * d, 6 + rand() * 7, 4 + rand() * 5, 7, 0.5)}" fill="#a85d1d" opacity=".55"/>`;
  }
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * 0.9, r = 1.5 + rand() * 3.2;
    g += `<path d="${craggy(bx + Math.cos(a) * brx * d, by + Math.sin(a) * bry * d, r, r * 0.8, 5, 0.6)}" fill="${rand() < 0.6 ? "#ffd48a" : "#e39a44"}"/>`;
  }
  // sauces: zigzag Japanese mayo, then a thinner eel-sauce drizzle, and sesame seeds
  let mayo = `M${L - 14} -70`;
  for (let k = 0; k < 8; k++) mayo += ` Q ${L + 44 + (k % 2) * 40} ${-62 + k * 18} ${L - 4 + (k % 2 ? -10 : 82)} ${-52 + k * 18}`;
  g += `<path d="${mayo}" fill="none" stroke="#f3d34f" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="${mayo}" fill="none" stroke="#fff6c4" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
  g += `<path d="M${L - 4} -40 q 40 10 64 -6 M${L} 6 q 36 12 66 -4 M${L + 4} 44 q 30 8 54 -10" fill="none" stroke="#5a2e14" stroke-width="4" stroke-linecap="round" opacity=".9"/>`;
  for (let i = 0; i < 26; i++) { const x = L - 10 + rand() * 90, y = -70 + rand() * 130; g += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.6" ry="1.4" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})" fill="#fbf3df" stroke="#c9b48a" stroke-width=".5"/>`; }
  return defs + g + `</g>`;
};

const dishes = {
  // Sembcorp: mini kitsune udon bowl with tofu skin, under a clear plastic lid like soup bowls on the belt
  sembcorp: plate(kitsuneUdon() + clearLid(228)),
  amk: plate(nigiri(C, C + 8, -10, 1.15, "#f7cf4f", "#e0aa26", `<rect x="-22" y="-80" width="44" height="160" fill="url(#nori)" rx="4"/><g transform="translate(70 -58) rotate(20)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-15" rx="10" ry="16" fill="#a45cc4" transform="rotate(${r})"/>`).join("")}<circle r="7" fill="#f5e36b"/></g>`)),
  smu: plate(tunaNigiri(C - 4, C - 80, -6, 0.92) + tunaNigiri(C + 4, C + 82, -6, 0.92)),
  sephora: plate(nigiri(C - 6, C - 64, -6, 0.86, "#f4844f", "#ffe7d6", `<path d="M-90 -30 q 60 -30 180 0" stroke="#3b1e0e" stroke-width="10" opacity=".22" fill="none"/>${[[-40, -10], [10, 5], [55, -12]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="11" ry="8" fill="#ef5d86"/>`).join("")}`) + nigiri(C + 6, C + 66, -6, 0.86, "#f4844f", "#ffe7d6", `${[[-30, 0], [20, -10]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="11" ry="8" fill="#ef5d86"/>`).join("")}`)),
  shopee: plate(ebiTempura(C - 14, C - 62, -8, 1) + ebiTempura(C - 6, C + 62, -8, 1)),
  aire: plate(`<path d="M${C - 170} ${C + 20} C ${C - 120} ${C - 140}, ${C + 120} ${C - 140}, ${C + 170} ${C + 20} C ${C + 120} ${C + 150}, ${C - 120} ${C + 150}, ${C - 170} ${C + 20} Z" fill="#3f8a3a"/><path d="M${C - 160} ${C + 20} L ${C + 160} ${C + 20}" stroke="#2c6b28" stroke-width="5"/>` +
    [[0, -58, 0], [0, 64, 0]].map(([dx, dy]) => nigiri(C + dx, C + dy, -6, 0.8, "#ffffff", "#ff6a3d", `${[-0.3, -0.1, 0.1, 0.3].map((f) => `<path d="M${f * 207} -55 q 14 50 -4 100" stroke="#ff5a2c" stroke-width="12" fill="none" opacity=".75"/>`).join("")}<path d="M100 0 l 34 -26 l 8 22 l 4 30 Z" fill="#ff5a2c"/>`)).join("")),
  // Fintech: chawanmushi, Japanese steamed egg
  fintech: plate(chawanmushi()),
  // Insurance: soft-shell crab hand roll
  insurance: plate(softShellHandRoll()),
  "ngee-ann": plate(unagiB(C - 4, C - 80, -6, 0.92) + unagiB(C + 4, C + 82, -6, 0.92)),
};

await fs.mkdir("public/assets/dishes", { recursive: true });
for (const [id, svg] of Object.entries(dishes)) await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(`public/assets/dishes/${id}.webp`);
console.log(Object.keys(dishes).length, "placeholders");
