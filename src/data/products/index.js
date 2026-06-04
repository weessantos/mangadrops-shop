// ============================================================================
// src/data/products/index.js
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
//
// ✅ Obter produtos
// ✅ Aplicar filtros simples
// ✅ Aplicar busca
//
// NÃO deve:
//
// ❌ Buscar Supabase
// ❌ Adaptar API
// ❌ Montar imagens
//
// ============================================================================

import { getProducts as getRawProducts } from "./series.catalog";

import {
  normalizeText,
  parseQuery,
  productSearchText,
} from "../../utils/search";

// ============================================================================
// filterProducts
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Filtra produtos por:
//
// - texto
// - aliases
// - prefix
// - parent_prefix
//
// ============================================================================

function filterProducts(products, search = "") {
  if (!search) {
    return products;
  }

  const normalizedSearch = normalizeText(search);

  const { prefix } = parseQuery(search);

  return products.filter((p) => {
    // =========================
    // Busca textual
    // =========================

    const textMatch = productSearchText(p).includes(normalizedSearch);

    // =========================
    // Busca por aliases
    // =========================

    const prefixMatch =
      prefix &&
      (normalizeText(p.prefix) === prefix ||
        normalizeText(p.parent_prefix) === prefix);

    return textMatch || prefixMatch;
  });
}

// ============================================================================
// getProducts
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Retorna produtos já filtrados
//
// ============================================================================

export async function getProducts(search = "") {
  console.log("🔎 getProducts:", search);

  const products = await getRawProducts();

  function filterProducts(products, search = "") {

    if (!search) {
      return products;
    }

    const normalizedSearch = normalizeText(search);

    const { prefix } = parseQuery(search);

    console.log("🎯 Prefix:", prefix);

    return products.filter((p) => {
      const textMatch = productSearchText(p).includes(normalizedSearch);

      const prefixMatch =
        prefix &&
        (normalizeText(p.prefix) === prefix ||
          normalizeText(p.parent_prefix) === prefix);

      if (prefixMatch) {
        console.log("✅", p.title);
      }

      return textMatch || prefixMatch;
    });
  }
}
