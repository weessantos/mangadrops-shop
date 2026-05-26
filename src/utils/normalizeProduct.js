// ============================================================================
// src/utils/normalizeProduct.js
// ============================================================================
//
// RESPONSABILIDADE DESTE ARQUIVO
// ----------------------------------------------------------------------------
// Padroniza produtos vindos da API.
//
// Ele é responsável por:
//
// ✅ Normalizar campos
// ✅ Garantir tipos seguros
// ✅ Gerar slugs
// ✅ Resolver imagens via util central
// ✅ Gerar URL interna
//
//
//
// O QUE ESTE ARQUIVO NÃO DEVE FAZER
// ----------------------------------------------------------------------------
//
// ❌ Não deve montar caminhos manualmente
// ❌ Não deve conhecer assets
// ❌ Não deve acessar React
// ❌ Não deve acessar DOM
//
// ============================================================================

import { img } from "./images";

// ============================================================================
// slugify
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Gera slugs amigáveis.
//
// EX:
//
// "One Piece"
// → "one-piece"
//
// ============================================================================

function slugify(str) {
  return str
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ============================================================================
// normalizeProduct
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Converte produto bruto vindo da API
// para o formato utilizado pelo projeto.
//
// ============================================================================

export function normalizeProduct(p) {
  // =========================
  // número seguro
  // =========================

  const volumeNumber = Number(p.number);

  const paddedNumber = Number.isFinite(volumeNumber)
    ? String(volumeNumber).padStart(2, "0")
    : null;

  // =========================
  // imagem do volume
  // =========================

  const volumeImage =
    p.prefix && paddedNumber
      ? img({
          prefix: p.prefix,

          parentPrefix: p.parent_prefix,

          file: `${p.prefix}${paddedNumber}.webp`,
        })
      : null;

  // =========================
  // slugs
  // =========================

  const seriesSlug = slugify(p.series_title);

  const volumeSlug =
    p.prefix && paddedNumber ? `${p.prefix}-${paddedNumber}` : null;

  const url = seriesSlug && volumeSlug ? `/${seriesSlug}/${volumeSlug}` : null;

  return {
    ...p,

    // =========================
    // identidade
    // =========================

    id: volumeSlug || `${p.prefix}-${p.number}` || crypto.randomUUID(),

    // =========================
    // conteúdo
    // =========================

    title: p.volume_title,

    series: p.series_title,

    prefix: p.prefix,

    volume: Number.isFinite(volumeNumber) ? volumeNumber : null,

    // =========================
    // preços
    // =========================

    coverPrice: p.cover_price,

    best_price: p.best_price,

    // =========================
    // imagem
    // =========================

    image: volumeImage || p.thumb || "/placeholder.png",

    // =========================
    // afiliados
    // =========================

    affiliate: {
      amazon: p.amazon,

      mercadoLivre: p.mercado_livre,
    },

    // =========================
    // preços externos
    // =========================

    amazonPrice: p.amazon_price,

    mlPrice: p.mercado_livre_price,

    // =========================
    // dados extras
    // =========================

    brand: p.brand,
    genre: p.genre,
    format: p.format,
    author: p.author,
    discount: p.discount,
    addedAt: p.added_at,

    // =========================
    // navegação
    // =========================

    seriesSlug,
    volumeSlug,
    url,
  };
}
