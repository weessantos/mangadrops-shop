const base =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

export const img = (path) => `${base}assets/${path}`;

import { createSeries, createSeriesVolumes } from "./series.factory.js";
import { supabaseClient } from "../../lib/supabase";

/**
 * 🔥 ADAPTER: API → FACTORY
 */
function buildSeriesFromAPI(apiData) {
  const SERIES = {};

  apiData.forEach((s) => {
    // cria a série apenas uma vez
    if (!SERIES[s.prefix]) {
      SERIES[s.prefix] = createSeries(s.prefix, {
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
        contentType: s.content_type,

        affiliateByVolume: {},
        tiktokByVolume: {},
        descriptionByVolume: {},
        addedAtByVolume: {},
      });
    }

    // adiciona dados do volume atual
    const current = SERIES[s.prefix];

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
  });

  return SERIES;
}

/**
 * 🔥 FETCH PRINCIPAL
 */
export async function getSERIES() {
  const { data, error } = await supabaseClient
    .from("series_volumes_view")
    .select("*");

  if (error) {
    console.error(error);
    return {};
  }

  return buildSeriesFromAPI(data);
}

export async function getProducts() {
  const SERIES = await getSERIES();

  const products = Object.values(SERIES).flatMap((s) => createSeriesVolumes(s));

  console.log(
    "PRODUTOS GERADOS:",
    products.map((p) => ({
      title: p.title,
      parent: p.parent_series_id,
      type: p.content_type,
    })),
  );

  return products;
}

/**
 * 🔥 CATÁLOGO (igual você já usa)
 */
export async function getSeriesCatalog() {
  const SERIES = await getSERIES();

  console.log(
    "CATALOGO:",
    Object.values(SERIES).map((s) => ({
      series: s.series,
      parent: s.parentSeriesId,
      type: s.contentType,
      prefix: s.prefix,
    })),
  );
  return [
    ...Object.values(SERIES).map((s) => ({
      name: s.series,
      totalVolumes: s.end - s.start + 1,
      thumb: s.thumb,
      subtitle: s.subtitle,
      author: s.author,
      genre: s.genre,
    })),

    {
      name: "Outros",
      thumb: img("others-series.webp"),
      subtitle: "Outras obras e volumes avulsos.",
    },
  ];
}
