// src/utils/search.js

export const ALIASES = {
  jjk: "jujutsu kaisen",
  aot: "attack on titan",
  snk: "shingeki no kyojin",
  op: "one piece",
  kgb: "kagurabachi",
  vinland: "vinland saga",
  haikyu: "haikyu",
  skmt: "sakamoto",
  ddd: "dandadan",
  vs: "versus",
};

export function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function expandAliases(tokens, aliases = ALIASES) {
  const out = [];
  for (const t of tokens) {
    const repl = aliases[t];
    if (repl) out.push(...repl.split(" "));
    else out.push(t);
  }
  return out;
}

export function parseQuery(q, aliases = ALIASES) {
  const norm = normalizeText(q);
  let tokens = norm.split(/\s+/).filter(Boolean);
  tokens = expandAliases(tokens, aliases);

  const numbers = tokens
    .map((t) => (/^\d+$/.test(t) ? Number(t) : null))
    .filter((n) => Number.isFinite(n));

  const words = tokens.filter((t) => !/^\d+$/.test(t));

  return { tokens, words, numbers };
}

export function productSearchText(p) {
  return normalizeText(
    `${p.title} ${p.tag ?? ""} ${p.series ?? ""} vol ${p.volume ?? ""}`
  );
}

export function uniqueSortedAvailableVolumes(items) {
  const set = new Set();

  for (const p of items) {
    const v = Number(p.volume);

    const isAvailable =
      (p.affiliate?.mercadoLivre && p.affiliate.mercadoLivre.trim() !== "") ||
      (p.affiliate?.amazon && p.affiliate.amazon.trim() !== "");

    if (Number.isFinite(v) && v > 0 && isAvailable) {
      set.add(v);
    }
  }

  return Array.from(set).sort((a, b) => a - b);
}

export function computeMissing(vols, total) {
  const have = new Set(vols);
  const missing = [];
  for (let v = 1; v <= total; v++) {
    if (!have.has(v)) missing.push(v);
  }
  return missing;
}

export function pickSeriesFromQuery(query, seriesNames) {
  const { words } = parseQuery(query);
  if (!words.length) return null;

  let best = { name: null, score: 0 };

  for (const name of seriesNames) {
    const n = normalizeText(name);
    let score = 0;

    for (const w of words) {
      if (n.includes(w) || n.split(" ").some((tok) => tok.startsWith(w))) {
        score++;
      }
    }

    if (score > best.score) best = { name, score };
  }

  return best.score >= 1 ? best.name : null;
}