// ============================================================================
// src/data/products/series.catalog.js
// ============================================================================
//
// RESPONSABILIDADE DESTE ARQUIVO
// ----------------------------------------------------------------------------
// Centraliza dados e adaptação das séries.
//
// Responsável por:
//
// ✅ Buscar séries no Supabase
// ✅ Adaptar API → Factory
// ✅ Criar objetos padronizados
// ✅ Gerar catálogo
// ✅ Gerar produtos
//
// NÃO deve:
//
// ❌ Filtrar busca
// ❌ Aplicar regras de UI
// ❌ Renderizar
//
// ============================================================================

import { supabaseClient } from "../../lib/supabase";

import { img } from "../../utils/images";

import { createSeries, createSeriesVolumes } from "./series.factory.js";

// ============================================================================
// buildSeriesFromAPI
// ============================================================================
//
// Converte API → Factory
//
// ============================================================================

function buildSeriesFromAPI(data = []) {
  const series = {};

  for (const s of data) {
    // =========================
    // Cria série apenas uma vez
    // =========================

    if (!series[s.prefix]) {
      series[s.prefix] = createSeries(s.prefix, {
        series: s.series_title,

        start: 1,
        end: s.total_volumes,

        brand: s.brand,
        author: s.author,
        genre: s.genre,

        subtitle: s.subtitle,
        format: s.format,
        editionLabel: s.edition_label,

        coverPrice: s.cover_price,

        thumb: s.thumb,

        parentSeriesId: s.parent_series_id,

        parentPrefix: s.parent_prefix,

        contentType: s.content_type,

        affiliateByVolume: {},
        tiktokByVolume: {},
        descriptionByVolume: {},
        addedAtByVolume: {},
      });
    }

    // =========================
    // Volume atual
    // =========================

    const current = series[s.prefix];

    current.affiliateByVolume[s.number] = {
      amazon: s.amazon?.trim() || null,

      mercadoLivre: s.mercado_livre?.trim() || null,
    };

    if (s.tiktok) {
      current.tiktokByVolume[s.number] = s.tiktok;
    }

    if (s.description) {
      current.descriptionByVolume[s.number] = s.description;
    }

    if (s.added_at) {
      current.addedAtByVolume[s.number] = s.added_at;
    }
  }

  return series;
}

// ============================================================================
// getSERIES
// ============================================================================
//
// Busca e adapta séries
//
// ============================================================================

export async function getSERIES() {
  const { data, error } = await supabaseClient
    .from("series_volumes_view")
    .select("*");

  if (error) {
    console.error("Erro ao buscar séries:", error);

    return {};
  }

  return buildSeriesFromAPI(data);
}

// ============================================================================
// getProducts
// ============================================================================
//
// Gera produtos prontos
//
// ============================================================================

export async function getProducts() {
  const series = await getSERIES();

  return Object.values(series).flatMap(createSeriesVolumes);
}

// ============================================================================
// getSeriesCatalog
// ============================================================================
//
// Gera catálogo simplificado
//
// ============================================================================

export async function getSeriesCatalog() {
  const series = await getSERIES();

  return [
    ...Object.values(series).map((s) => ({
      name: s.series,

      // usado para busca/aliases
      prefix: s.prefix,

      parentPrefix: s.parentPrefix,

      totalVolumes:
        s.end - s.start + 1,

      thumb: s.thumb,

      subtitle: s.subtitle,

      author: s.author,

      genre: s.genre,
    })),

    {
      name: "Outros",

      thumb: img({
        prefix: "others-series.webp",
      }),

      subtitle:
        "Outras obras e volumes avulsos.",
    },
  ];
}