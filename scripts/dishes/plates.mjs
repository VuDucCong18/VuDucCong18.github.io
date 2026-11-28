// Plate rims, one per category, after the Sushi Express price-plate poster: 640px transparent webp,
// plate disc r = 308 (matches PLATE_MASK in sushi-conveyor-menu.tsx). Written to public/assets/plates/plate-<category>.webp.
// Education: white marble crackle · Experience: black with a gold line rim · Projects: speckled gold glaze
// Spare designs, not used: red with white waves, navy with white bursts.
import sharp from "sharp";

const S = 640, C = 320, R = 308;
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const f = (n) => n.toFixed(1);
const svg = (defs, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>
 <clipPath id="disc"><circle cx="${C}" cy="${C}" r="${R}"/></clipPath>
 <radialGradient id="gloss" cx="34%" cy="28%" r="45%"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
 <radialGradient id="edge" cx="50%" cy="50%" r="50%"><stop offset=".86" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></radialGradient>
 ${defs}</defs><g clip-path="url(#disc)">${body}
 <circle cx="${C}" cy="${C}" r="${R}" fill="url(#edge)"/>
 <circle cx="${C}" cy="${C}" r="${R}" fill="url(#gloss)"/></g></svg>`;
/** Shallow well: a soft shadow line and a highlight just inside it, so the plate reads as a dish, not a disc. */
const well = (r, dark = "#000", o = 0.14) => `<circle cx="${C}" cy="${C + 2}" r="${r}" fill="none" stroke="${dark}" stroke-opacity="${o}" stroke-width="4"/><circle cx="${C}" cy="${C - 1}" r="${r - 3}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`;

// 1 · white marble with black crackle contours (the poster's $1 plate)
function marble() {
  let lines = "";
  for (let y = 10; y < S; y += 34 + rnd() * 30) {
    let x = -20, yy = y, d = `M${x} ${f(yy)}`;
    while (x < S + 20) {
      const nx = x + 18 + rnd() * 34, ny = yy + (rnd() - 0.5) * 52;
      d += ` Q ${f(x + (nx - x) / 2)} ${f(yy + (rnd() - 0.5) * 70)} ${f(nx)} ${f(ny)}`;
      if (rnd() < 0.12) lines += `<path d="M${f(nx)} ${f(ny)} q ${f((rnd() - 0.5) * 30)} ${f(14 + rnd() * 16)} ${f((rnd() - 0.5) * 20)} ${f(28 + rnd() * 26)}" fill="none" stroke="#1f1f1f" stroke-width="2.4" stroke-linecap="round" opacity=".85"/>`;
      if (rnd() < 0.08) { const r = 6 + rnd() * 9; d += ` m 0 0 a ${f(r)} ${f(r * 0.8)} 0 1 0 0.1 0`; }
      x = nx; yy = ny;
    }
    lines += `<path d="${d}" fill="none" stroke="#1f1f1f" stroke-width="${f(2.4 + rnd() * 1.6)}" stroke-linecap="round" stroke-linejoin="round" opacity=".88"/>`;
    if (rnd() < 0.5) { const bx = rnd() * S, by = y + 8; lines += `<path d="M${f(bx)} ${f(by)} q ${f(14 + rnd() * 20)} ${f(10 + rnd() * 14)} ${f(30 + rnd() * 30)} ${f(rnd() * 22 - 4)}" fill="none" stroke="#1f1f1f" stroke-width="2.2" opacity=".8"/>`; }
  }
  return svg(`<radialGradient id="b1" cx="46%" cy="42%" r="60%"><stop offset="0" stop-color="#fbfbf6"/><stop offset=".75" stop-color="#ecece4"/><stop offset="1" stop-color="#d6d6cc"/></radialGradient>`,
    `<rect width="${S}" height="${S}" fill="url(#b1)"/>${lines}${well(236)}`);
}

// 2 · black plate, fine gold guilloche band on the rim, plain black centre (the poster's $1.50 plate)
function blackGold() {
  let band = "";
  for (let k = 0; k < 96; k++) { const a = (k / 96) * Math.PI * 2; band += `<circle cx="${f(C + Math.cos(a) * 258)}" cy="${f(C + Math.sin(a) * 258)}" r="50" fill="none" stroke="#c9b866" stroke-width="1.1" opacity=".55"/>`; }
  for (let k = 0; k < 96; k++) { const a = (k / 96 + 1 / 192) * Math.PI * 2; band += `<ellipse cx="${f(C + Math.cos(a) * 256)}" cy="${f(C + Math.sin(a) * 256)}" rx="58" ry="30" transform="rotate(${f((a * 180) / Math.PI + 35)} ${f(C + Math.cos(a) * 256)} ${f(C + Math.sin(a) * 256)})" fill="none" stroke="#e6d68a" stroke-width=".9" opacity=".35"/>`; }
  return svg(`<radialGradient id="b2" cx="45%" cy="40%" r="62%"><stop offset="0" stop-color="#3a3839"/><stop offset="1" stop-color="#161515"/></radialGradient>
   <mask id="ann"><rect width="${S}" height="${S}" fill="#000"/><circle cx="${C}" cy="${C}" r="304" fill="#fff"/><circle cx="${C}" cy="${C}" r="212" fill="#000"/></mask>`,
    `<rect width="${S}" height="${S}" fill="url(#b2)"/><g mask="url(#ann)">${band}</g>
     <circle cx="${C}" cy="${C}" r="210" fill="#1d1c1c"/><circle cx="${C}" cy="${C}" r="211" fill="none" stroke="#8f8550" stroke-width="2.5" opacity=".8"/>${well(206, "#000", 0.4)}`);
}

// 3 · poster red with white seigaiha waves on the rim
function redWaves() {
  let waves = "";
  for (let ring = 0; ring < 3; ring++) {
    const r = 236 + ring * 26, n = 34 + ring * 4;
    for (let k = 0; k < n; k++) { const a = ((k + (ring % 2) * 0.5) / n) * Math.PI * 2, x = C + Math.cos(a) * r, y = C + Math.sin(a) * r;
      waves += [18, 12, 6].map((rr) => `<circle cx="${f(x)}" cy="${f(y)}" r="${rr}" fill="none" stroke="#fff" stroke-width="2" opacity=".42"/>`).join(""); }
  }
  return svg(`<radialGradient id="b3" cx="45%" cy="40%" r="62%"><stop offset="0" stop-color="#ec4c64"/><stop offset=".7" stop-color="#dc2f4b"/><stop offset="1" stop-color="#a81d36"/></radialGradient>
   <mask id="ann3"><rect width="${S}" height="${S}" fill="#000"/><circle cx="${C}" cy="${C}" r="304" fill="#fff"/><circle cx="${C}" cy="${C}" r="222" fill="#000"/></mask>`,
    `<rect width="${S}" height="${S}" fill="url(#b3)"/><g mask="url(#ann3)">${waves}</g>
     <circle cx="${C}" cy="${C}" r="219" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/><circle cx="${C}" cy="${C}" r="211" fill="none" stroke="#8c2234" stroke-width="3" opacity=".7"/>${well(205, "#5a0d1c", 0.3)}`);
}

// 4 · glossy gold glaze with blue and brown speckles (the poster's $2.50 plate)
function goldSpeckle() {
  let sp = "";
  for (let i = 0; i < 260; i++) { const a = rnd() * Math.PI * 2, d = R * Math.sqrt(rnd()); sp += `<circle cx="${f(C + Math.cos(a) * d)}" cy="${f(C + Math.sin(a) * d)}" r="${f(0.8 + rnd() * 1.8)}" fill="#fff6c2" opacity="${f(0.35 + rnd() * 0.4)}"/>`; }
  for (let i = 0; i < 46; i++) { const a = rnd() * Math.PI * 2, d = 255 + rnd() * 45, col = ["#8fb8d8", "#9cc3e0", "#c4703a", "#a8c9e4", "#e7e3d4"][i % 5]; sp += `<circle cx="${f(C + Math.cos(a) * d)}" cy="${f(C + Math.sin(a) * d)}" r="${f(2.5 + rnd() * 6)}" fill="${col}" opacity=".85"/>`; }
  return svg(`<radialGradient id="b4" cx="44%" cy="40%" r="62%"><stop offset="0" stop-color="#f0dc6a"/><stop offset=".7" stop-color="#d9c04c"/><stop offset="1" stop-color="#b99f2e"/></radialGradient>
   <filter id="soft"><feGaussianBlur stdDeviation="9"/></filter>`,
    `<rect width="${S}" height="${S}" fill="url(#b4)"/>
     <path d="M${C - 300} ${C + 40} Q ${C - 292} ${C + 190} ${C - 190} ${C + 262}" stroke="#8fb8d8" stroke-width="30" fill="none" opacity=".75" filter="url(#soft)"/>
     <path d="M${C + 150} ${C - 270} Q ${C + 290} ${C - 160} ${C + 292} ${C + 30}" stroke="#a7834a" stroke-width="34" fill="none" opacity=".45" filter="url(#soft)"/>
     ${sp}${well(240, "#6b5714", 0.22)}`);
}

// 5 · navy (the poster bunting) with white bursts and pink dots
function navyBurst() {
  let deco = "";
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + 0.2, x = C + Math.cos(a) * 263, y = C + Math.sin(a) * 263;
    deco += Array.from({ length: 12 }, (_, j) => { const t = (j / 12) * Math.PI * 2; return `<line x1="${f(x + Math.cos(t) * 7)}" y1="${f(y + Math.sin(t) * 7)}" x2="${f(x + Math.cos(t) * 20)}" y2="${f(y + Math.sin(t) * 20)}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`; }).join("") + `<circle cx="${f(x)}" cy="${f(y)}" r="3" fill="#fff"/>`;
    const b = a + Math.PI / 10; deco += `<circle cx="${f(C + Math.cos(b) * 262)}" cy="${f(C + Math.sin(b) * 262)}" r="7" fill="#efbccb"/>`; }
  return svg(`<radialGradient id="b5" cx="45%" cy="40%" r="62%"><stop offset="0" stop-color="#6a6886"/><stop offset=".7" stop-color="#56546c"/><stop offset="1" stop-color="#3d3b50"/></radialGradient>`,
    `<rect width="${S}" height="${S}" fill="url(#b5)"/>${deco}
     <circle cx="${C}" cy="${C}" r="221" fill="none" stroke="#efbccb" stroke-width="4" opacity=".9"/>${well(212, "#1c1b28", 0.35)}`);
}

// The three designs in use, one per category. redWaves and navyBurst are kept as spare designs for a future category.
const plates = { education: marble, experience: blackGold, projects: goldSpeckle };
for (const [name, draw] of Object.entries(plates)) await sharp(Buffer.from(draw())).webp({ quality: 90 }).toFile(`public/assets/plates/plate-${name}.webp`);
console.log(`${Object.keys(plates).length} plates`);
