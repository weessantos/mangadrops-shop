const base =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

export const img = (path) => `${base}assets/${path}`;

import { createSeries } from "./series.factory.js";

/**
 * 🔥 ADAPTER: API → FACTORY
 */
function buildSeriesFromAPI(apiData) {
  const SERIES = {};

  apiData.forEach((s) => {
    const affiliateByVolume = {};
    const tiktokByVolume = {};
    const descriptionByVolume = {};
    const addedAtByVolume = {};

    (s.volumes || []).forEach((v) => {
      affiliateByVolume[v.number] = {
        amazon: v.amazon?.trim() || null,
        mercadoLivre: v.mercado_livre?.trim() || null,
      };

      if (v.tiktok) {
        tiktokByVolume[v.number] = v.tiktok;
      }

      if (v.description) {
        descriptionByVolume[v.number] = v.description;
      }

      if (v.added_at) {
        addedAtByVolume[v.number] = v.added_at;
      }
    });

    SERIES[s.prefix] = createSeries(s.prefix, {
      series: s.title,
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

      affiliateByVolume,
      tiktokByVolume,
      descriptionByVolume,
      addedAtByVolume,
    });
  });

  return SERIES;
}

/**
 * 🔥 FETCH PRINCIPAL
 */
export async function getSERIES() {
  const res = await fetch("http://localhost:3000/api/series");
  const data = await res.json();

  return buildSeriesFromAPI(data);
}

/**
 * 🔥 CATÁLOGO (igual você já usa)
 */
export async function getSeriesCatalog() {
  const SERIES = await getSERIES();

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