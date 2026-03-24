import { getSERIES } from "./series.catalog.js";
import { createSeriesVolumes } from "./series.factory.js";

import { affiliateMap } from "./affiliates/affiliates.map.js";
import { descriptionMap } from "./descriptions/descriptions.map.js";
import { tiktokMap } from "./tiktok/tiktok.map.js";

// 🔥 URL dinâmica (resolve local + produção)
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://SEU-BACKEND.com"; // ⬅️ TROCAR DEPOIS

export async function getProducts(search = "") {
  const res = await fetch(
    `${API_URL}/api/series/full${search}`
  );

  const data = await res.json();

  return data.flatMap((series) =>
    series.volumes.map((v) => ({
      id: `${series.prefix}-${String(v.number).padStart(2, "0")}`,

      title: `${series.title} Vol. ${String(v.number).padStart(2, "0")}`,
      series: series.title,
      volume: v.number,

      image: `/assets/${series.prefix}${String(v.number).padStart(2, "0")}.webp`,

      brand: series.brand,
      author: series.author,
      genre: series.genre,
      format: series.format,
      coverPrice: series.cover_price,

      description: v.description,
      tiktokUrl: v.tiktok,
      addedAt: v.addedAt,

      affiliate: {
        amazon: v.amazon,
        mercadoLivre: v.mercadoLivre,
      },

      // 🔥 novos campos
      bestPrice: v.best_price,
      discount: v.discount,
    }))
  );
}