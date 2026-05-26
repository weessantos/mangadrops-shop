// ============================================================================
// src/utils/search.js
// ============================================================================
//
// RESPONSABILIDADE DESTE ARQUIVO
// ----------------------------------------------------------------------------
// Este arquivo centraliza TODA a inteligência de busca do site.
//
// Ele é responsável por:
//
// ✅ Normalização de texto
// ✅ Criação de slugs
// ✅ Parsing de query
// ✅ Alias/siglas
// ✅ Busca fuzzy
// ✅ Busca exata
// ✅ Utilitários de volumes
//
//
//
// O QUE ESTE ARQUIVO NÃO DEVE FAZER
// ----------------------------------------------------------------------------
// ❌ Não deve navegar entre páginas
// ❌ Não deve usar React
// ❌ Não deve usar hooks
// ❌ Não deve renderizar UI
// ❌ Não deve acessar DOM
//
//
//
// ARQUITETURA DA BUSCA
// ----------------------------------------------------------------------------
//
// detectExactSeries()
// ↓
// Navegação precisa
// Rotas
// URLs
//
//
//
// pickSeriesFromQuery()
// ↓
// Busca fuzzy/inteligente
// Sugestões
// Relevância
// Busca parcial
//
//
//
// EXEMPLOS
// ----------------------------------------------------------------------------
//
// detectExactSeries("jjk")
// → "Jujutsu Kaisen"
//
// detectExactSeries("jujutsu 03")
// → null
//
//
//
// pickSeriesFromQuery("jujutsu")
// → "Jujutsu Kaisen"
//
// pickSeriesFromQuery("attack")
// → "Attack on Titan"
//
// ============================================================================

// ============================================================================
// ALIASES
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Permite que o usuário use:
//
// - siglas
// - apelidos
// - nomes alternativos
// - abreviações
//
// sem precisar digitar o nome completo.
//
//
//
// EXEMPLOS
// ----------------------------------------------------------------------------
//
// "jjk"
// → "jujutsu kaisen"
//
// "aot"
// → "attack on titan"
//
// "op"
// → "one piece"
//
//
//
// ESTRUTURA
// ----------------------------------------------------------------------------
// O ideal é separar:
//
// - aliases oficiais
// - aliases da comunidade
// - aliases internos
//
// Isso facilita manutenção futura.
//
// ============================================================================

// ============================================================================
// Definição de aliases oficiais
// ============================================================================

import { SERIES_ALIASES } from "../data/aliases";

export const ALIASES = Object.entries(SERIES_ALIASES).reduce(
  (acc, [prefix, aliases]) => {
    aliases.forEach((alias) => {
      acc[alias.toLowerCase().trim()] = prefix;
    });

    return acc;
  },
  {},
);

// ============================================================================
// normalizeText
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Normaliza qualquer texto para comparação.
//
// Remove:
// - maiúsculas/minúsculas
// - acentos
// - símbolos
// - espaços duplicados
//
//
//
// EXEMPLO
// ----------------------------------------------------------------------------
//
// "Jujutsu Kaisen!!!"
// → "jujutsu kaisen"
//
// "Shingeki no Kyojin"
// → "shingeki no kyojin"
//
// ============================================================================

export function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// ============================================================================
// normalizeCompact
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Remove TODOS os espaços do texto.
//
// Usado para:
//
// - busca compacta
// - aliases
// - comparação agressiva
//
//
//
// EXEMPLO
// ----------------------------------------------------------------------------
//
// "gash bell"
// → "gashbell"
//
// "one piece"
// → "onepiece"
//
// ============================================================================

export function normalizeCompact(s) {
  return normalizeText(s).replace(/\s+/g, "");
}

// ============================================================================
// getAcronym
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Gera siglas automáticas.
//
//
//
// EXEMPLO
// ----------------------------------------------------------------------------
//
// "attack on titan"
// → "aot"
//
// "jujutsu kaisen"
// → "jk"
//
// ============================================================================

export function getAcronym(s) {
  return normalizeText(s)
    .split(" ")
    .map((w) => w[0])
    .join("");
}

// ============================================================================
// slugify
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Cria slugs para URLs.
//
//
//
// EXEMPLO
// ----------------------------------------------------------------------------
//
// "Jujutsu Kaisen"
// → "jujutsu-kaisen"
//
// ============================================================================

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ============================================================================
// expandAliases
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Expande aliases da busca.
//
//
//
// EXEMPLO
// ----------------------------------------------------------------------------
//
// ["jjk", "12"]
// → ["jujutsu", "kaisen", "12"]
//
// ============================================================================

export function expandAliases(tokens, aliases = ALIASES) {
  const out = [];

  for (const t of tokens) {
    const repl = aliases[t];

    if (repl) {
      out.push(...repl.split(" "));
    } else {
      out.push(t);
    }
  }

  return out;
}

// ============================================================================
// parseQuery
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Faz parsing inteligente da busca.
//
// Separa:
// - palavras
// - números
// - aliases
//
//
//
// EXEMPLO
// ----------------------------------------------------------------------------
//
// "jjk 12"
//
// →
// {
//   tokens: ["jujutsu", "kaisen", "12"],
//   words: ["jujutsu", "kaisen"],
//   numbers: [12]
// }
//
// ============================================================================

export function parseQuery(q, aliases = ALIASES) {
  const norm = normalizeText(q);

  const tokens = norm.split(/\s+/).filter(Boolean);

  let detectedPrefix = null;

  for (const token of tokens) {
    const prefix = aliases[token];

    if (prefix) {
      detectedPrefix = prefix;
      break;
    }
  }

  const numbers = tokens
    .map((t) => (/^\d+$/.test(t) ? Number(t) : null))
    .filter(Number.isFinite);

  const words = tokens.filter((t) => !/^\d+$/.test(t));

  return {
    tokens,
    words,
    numbers,
    prefix: detectedPrefix,
  };
}
// ============================================================================
// productSearchText
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Gera o texto pesquisável de um produto.
//
// Centraliza:
// - título
// - série
// - tags
// - volume
//
// ============================================================================

export function productSearchText(p) {
  return normalizeText(
    `
      ${p.title}
      ${p.tag ?? ""}
      ${p.series ?? ""}
      vol ${p.volume ?? ""}
    `,
  );
}

// ============================================================================
// uniqueSortedAvailableVolumes
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Retorna volumes disponíveis:
//
// - únicos
// - ordenados
// - apenas com link afiliado
//
// ============================================================================

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

// ============================================================================
// computeMissing
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Descobre quais volumes estão faltando.
//
//
//
// EXEMPLO
// ----------------------------------------------------------------------------
//
// vols = [1,2,4]
// total = 5
//
// → [3,5]
//
// ============================================================================

export function computeMissing(vols, total) {
  const have = new Set(vols);

  const missing = [];

  for (let v = 1; v <= total; v++) {
    if (!have.has(v)) {
      missing.push(v);
    }
  }

  return missing;
}

// ============================================================================
// detectExactSeries
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Detecta intenção EXATA de navegação.
//
// Esta função é usada SOMENTE para:
//
// ✅ navegar para páginas de coleção
// ✅ decidir rotas
// ✅ URLs
//
//
//
// REGRAS
// ----------------------------------------------------------------------------
// Esta função é extremamente rígida.
//
// Ela NÃO aceita:
//
// ❌ fuzzy
// ❌ partial
// ❌ aproximação
//
//
//
// EXEMPLOS
// ----------------------------------------------------------------------------
//
// "jjk"
// → coleção
//
// "jujutsu kaisen"
// → coleção
//
// "jujutsu"
// → null
//
// "jujutsu 12"
// → null
//
// ============================================================================

export function detectExactSeries(query, seriesNames) {
  const queryNorm = normalizeText(query);
  const queryCompact = normalizeCompact(query);

  // 🔥 bloqueia buscas de volume
  if (/\d/.test(queryNorm)) {
    return null;
  }

  for (const item of seriesNames) {
    const name = item.name;
    const nameNorm = normalizeText(name);
    const nameCompact = normalizeCompact(name);
    const acronym = getAcronym(name);

    // nome exato
    if (queryNorm === nameNorm) {
      return name;
    }

    // compact exato
    if (queryCompact === nameCompact) {
      return name;
    }

    // sigla exata
    if (queryCompact === acronym) {
      return name;
    }

    // aliases exatos
    for (const [alias, original] of Object.entries(ALIASES)) {
      if (original === nameNorm && queryCompact === normalizeCompact(alias)) {
        return name;
      }
    }
  }

  return null;
}

// ============================================================================
// pickSeriesFromQuery
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Busca fuzzy/inteligente.
//
// Esta função tenta ADIVINHAR
// qual série o usuário provavelmente quis dizer.
//
//
//
// DIFERENÇA PARA detectExactSeries()
// ----------------------------------------------------------------------------
//
// detectExactSeries()
// → rígida
//
// pickSeriesFromQuery()
// → flexível
//
//
//
// EXEMPLOS
// ----------------------------------------------------------------------------
//
// "jujutsu"
// → "Jujutsu Kaisen"
//
// "attack"
// → "Attack on Titan"
//
// "gashbell"
// → "Gash Bell"
//
// ============================================================================

export function pickSeriesFromQuery(query, seriesNames) {
  const { words, prefix } = parseQuery(query);

  if (!words.length && !prefix) {
    return [];
  }

  const queryNorm = normalizeText(query);

  const queryCompact = normalizeCompact(query);

  const matches = [];

  for (const item of seriesNames) {
    const name = item.name;

    const nameNorm = normalizeText(name);

    const nameCompact = normalizeCompact(name);

    const acronym = getAcronym(name);

    let score = 0;

    // =========================
    // ALIAS → PREFIX
    // =========================

    const comparePrefix = item.parentPrefix || item.prefix;

    if (prefix && normalizeCompact(comparePrefix) === prefix) {
      score += 1000;
    }

    // =========================
    // Busca normal
    // =========================

    if (nameNorm.includes(queryNorm)) score += 5;

    if (nameCompact === queryCompact) score += 100;

    if (nameCompact.includes(queryCompact)) score += 10;

    if (queryCompact.includes(nameCompact)) score += 8;

    for (const w of words) {
      if (nameNorm.includes(w)) score += 1;
    }

    if (acronym === queryCompact) score += 6;

    if (score > 0) {
      matches.push({
        name,
        score,
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  return matches.map((m) => m.name);
}
