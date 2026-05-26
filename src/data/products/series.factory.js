// ============================================================================
// src/data/series.factory.js
// ============================================================================
//
// RESPONSABILIDADE DESTE ARQUIVO
// ----------------------------------------------------------------------------
// Centraliza a criação de objetos de série e produtos.
//
// Ele é responsável por:
//
// ✅ Criar séries
// ✅ Criar volumes
// ✅ Normalizar dados
// ✅ Gerar produtos padronizados
// ✅ Resolver imagens usando a util central
//
//
//
// O QUE ESTE ARQUIVO NÃO DEVE FAZER
// ----------------------------------------------------------------------------
//
// ❌ Não deve acessar DOM
// ❌ Não deve usar React
// ❌ Não deve fazer chamadas API
// ❌ Não deve conhecer componentes
// ❌ Não deve montar caminhos manualmente
//
// ============================================================================

import { img } from "../../utils/images";

// ============================================================================
// pad2
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Adiciona zero à esquerda.
//
// EX:
//
// 1 → 01
// 9 → 09
// 12 → 12
//
// ============================================================================

function pad2(n) {
  return String(n).padStart(2, "0");
}

// ============================================================================
// splitMulti
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Divide strings múltiplas:
//
// "Ação/Fantasia"
// "Ação|Fantasia"
// "Ação,Fantasia"
//
// → ["Ação","Fantasia"]
//
// ============================================================================

function splitMulti(value) {
  return String(value || "")
    .split(/[\/|,]/g)
    .map((v) => v.trim())
    .filter(Boolean);
}

// ============================================================================
// normalizeAffiliate
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Padroniza links afiliados.
//
// ============================================================================

export function normalizeAffiliate(value) {
  if (value && typeof value === "object") {
    return {
      mercadoLivre:
        typeof value.mercadoLivre === "string" ? value.mercadoLivre : "",

      amazon: typeof value.amazon === "string" ? value.amazon : "",
    };
  }

  if (typeof value === "string") {
    return {
      mercadoLivre: value,
      amazon: "",
    };
  }

  return {
    mercadoLivre: "",
    amazon: "",
  };
}

// ============================================================================
// normalizePrice
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Converte preço para número.
//
// ============================================================================

function normalizePrice(value) {
  if (value == null || value === "") {
    return null;
  }

  const num =
    typeof value === "number"
      ? value
      : Number(String(value).replace(",", ".").trim());

  return Number.isFinite(num) ? num : null;
}

// ============================================================================
// createSeries
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Cria uma série padronizada.
//
// ============================================================================

export function createSeries(prefix, config) {
  return {
    prefix,
    start: 1,
    imageExt: "webp",

    ...config,

    thumb:
      config.thumb ||
      img({
        prefix,
        parentPrefix: config.parentPrefix,
        file: `${prefix}-series.webp`,
      }),
  };
}

// ============================================================================
// createSeriesVolumes
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Gera os produtos/volumes
// de uma série.
//
// ============================================================================

export function createSeriesVolumes({
  series,
  prefix,
  start,
  end,

  brand = "",
  imageExt = "webp",

  affiliateByVolume = {},
  tiktokByVolume = {},
  descriptionByVolume = {},
  addedAtByVolume = {},

  defaultCoverPrice = null,
  coverPriceByVolume = {},
  coverPrice = null,

  editionLabel = "",
  author = "",
  genre = "",
  format = "",

  parentSeriesId = null,
  parentPrefix = null,
  contentType = null,
}) {
  const normalizedDefaultCoverPrice = normalizePrice(
    defaultCoverPrice ?? coverPrice,
  );

  return Array.from({ length: end - start + 1 }, (_, i) => {
    const volume = start + i;
    const vv = pad2(volume);

    const titleBase = editionLabel
      ? `${series} – ${editionLabel} Vol. ${vv}`
      : `${series} Vol. ${vv}`;

    const finalFormat = format || editionLabel || "";

    const finalCoverPrice =
      normalizePrice(coverPriceByVolume?.[volume]) ??
      normalizedDefaultCoverPrice;


    return {
      id: `${prefix}-${vv}`,

      series,
      volume,
      title: titleBase,

      brand: brand.trim(),
      author: author.trim(),
      genre: genre.trim(),

      authorList: splitMulti(author),

      genreList: splitMulti(genre),

      format: finalFormat.trim(),

      parent_series_id: parentSeriesId,

      content_type: contentType,

      // =========================
      // IMAGEM
      // =========================

      image: img({
        prefix,

        parentPrefix,

        file: `${prefix}${vv}.${imageExt}`,
      }),

      affiliate: normalizeAffiliate(affiliateByVolume[volume]),

      tiktokUrl: tiktokByVolume[volume] || "",

      description: descriptionByVolume[volume] || "",

      addedAt: addedAtByVolume[volume] || null,

      coverPrice: finalCoverPrice,
    };
  });
}
