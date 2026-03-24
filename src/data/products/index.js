// import { getSERIES } from "./series.catalog.js";
// import { createSeriesVolumes } from "./series.factory.js";

// import { affiliateMap } from "./affiliates/affiliates.map.js";
// import { descriptionMap } from "./descriptions/descriptions.map.js";
// import { tiktokMap } from "./tiktok/tiktok.map.js";
import { supabaseClient } from "../../lib/supabase";

export async function getProducts(search = "") {
  const { data, error } = await supabaseClient
    .from("series_volumes_view")
    .select("*")

  if (error) {
    console.error(error)
    return []
  }

  const result = data.map((v) => ({
    id: `${v.prefix}-${String(v.number).padStart(2, "0")}`,

    prefix: v.prefix,

    title: `${v.series_title} Vol. ${String(v.number).padStart(2, "0")}`,
    total_volumes: v.total_volumes,

    series: v.series_title, // 🔥 ESSENCIAL
    volume: v.number,      // 🔥 ESSENCIAL

    image: `/assets/${v.prefix}${String(v.number).padStart(2, "0")}.webp`,

    thumb: v.thumb,

    brand: v.brand,
    author: v.author,
    genre: v.genre,
    format: v.format,
    coverPrice: v.cover_price,
    discount: Number(v.discount) || 0,

    description: v.description,
    tiktokUrl: v.tiktok,
    addedAt: v.added_at,

    affiliate: {
      amazon: v.amazon,
      mercadoLivre: v.mercado_livre,
    },
  }))

  if (search) {
    return result.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    )
  }

  return result
}