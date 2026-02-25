// src/data/products/series.factory.js
const base = import.meta.env.BASE_URL;
export const img = (path) => `${base}assets/${path}`;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function splitMulti(value) {
  return String(value || "")
    .split(/[\/|,]/g) // separa "Shounen/Seinen"
    .map((v) => v.trim())
    .filter(Boolean);
}

export function normalizeAffiliate(value) {
  if (value && typeof value === "object") {
    return {
      mercadoLivre:
        typeof value.mercadoLivre === "string" ? value.mercadoLivre : "",
      amazon: typeof value.amazon === "string" ? value.amazon : "",
    };
  }
  if (typeof value === "string") {
    return { mercadoLivre: value, amazon: "" };
  }
  return { mercadoLivre: "", amazon: "" };
}

export function createSeriesVolumes({
  series,
  prefix,
  start,
  end,
  brand = "",
  imageExt = "jpeg",
  affiliateByVolume = {},
  tiktokByVolume = {},
  descriptionByVolume = {},
  editionLabel = "",
  author = "",
  genre = "",
  addedAtByVolume = {},
  format = "",
}) {
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const volume = start + i;
    const vv = pad2(volume);

    const titleBase = editionLabel
      ? `${series} – ${editionLabel} Vol. ${vv}`
      : `${series} Vol. ${vv}`;

    // 🔥 garante consistência do formato
    const finalFormat = format || editionLabel || "";

    return {
      id: `${prefix}-${vv}`,
      series,
      volume,
      title: titleBase,

      brand: (brand || "").trim(),
      author: (author || "").trim(),
      genre: (genre || "").trim(),

      // ✅ CAMPOS IMPORTANTES PARA FILTRO
      authorList: splitMulti(author),
      genreList: splitMulti(genre),
      format: finalFormat.trim(),

      image: img(`${prefix}${vv}.${imageExt}`),

      affiliate: normalizeAffiliate(affiliateByVolume[volume]),
      tiktokUrl: tiktokByVolume[volume] || "",
      description: descriptionByVolume[volume] || "",
      addedAt: addedAtByVolume[volume] || null,
    };
  });
}