// Build: bundle React (esbuild) + compile Tailwind v4 (compiler API) into ./dist.
// Usage: node scripts/build.mjs
import { build as esbuild, transform } from "esbuild";
import { compile } from "tailwindcss";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");
const require = createRequire(import.meta.url);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])));
  return files.flat();
}

async function copyDir(from, to) {
  await fs.mkdir(to, { recursive: true });
  for (const e of await fs.readdir(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) await copyDir(a, b);
    else await fs.copyFile(a, b);
  }
}

// 1. JavaScript
await fs.rm(out, { recursive: true, force: true });
await esbuild({
  entryPoints: [path.join(root, "src/main.tsx")],
  bundle: true,
  minify: true,
  format: "esm",
  target: "es2022",
  jsx: "automatic",
  alias: { "@": path.join(root, "src") },
  define: { "process.env.NODE_ENV": '"production"' },
  outfile: path.join(out, "assets/app.js"),
  logLevel: "warning",
});

// 2. CSS: scan source files for class candidates, then let Tailwind generate only what is used.
const sources = (await walk(path.join(root, "src"))).filter((f) => /\.(tsx?|jsx?|html)$/.test(f));
const candidates = new Set();
for (const file of [...sources, path.join(root, "index.html")]) {
  const text = await fs.readFile(file, "utf8");
  for (const token of text.split(/[\s"'`{}]+/)) if (token) candidates.add(token);
}
const twDir = path.dirname(require.resolve("tailwindcss/package.json"));
const cssEntry = path.join(root, "src/styles/globals.css");
const compiler = await compile(await fs.readFile(cssEntry, "utf8"), {
  base: path.dirname(cssEntry),
  from: cssEntry,
  async loadStylesheet(id, base) {
    let file;
    if (id === "tailwindcss") file = path.join(twDir, "index.css");
    else if (id.startsWith("tailwindcss/")) file = path.join(twDir, id.slice("tailwindcss/".length).replace(/(\.css)?$/, ".css"));
    else file = path.resolve(base, id);
    return { path: file, base: path.dirname(file), content: await fs.readFile(file, "utf8") };
  },
});
const css = (await transform(compiler.build([...candidates]), { loader: "css", minify: true })).code;
await fs.writeFile(path.join(out, "assets/app.css"), css);

// 3. HTML + static files
await fs.copyFile(path.join(root, "index.html"), path.join(out, "index.html"));
await copyDir(path.join(root, "public"), out);
await fs.writeFile(path.join(out, ".nojekyll"), "");

const size = async (f) => ((await fs.stat(path.join(out, f))).size / 1024).toFixed(1) + " KB";
console.log(`built dist/  app.js ${await size("assets/app.js")} · app.css ${await size("assets/app.css")}`);
