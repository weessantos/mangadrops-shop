// src/data/products/series.factory.js
const base =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

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

function normalizePrice(value) {
  if (value == null || value === "") return null;

  const num =
    typeof value === "number"
      ? value
      : Number(String(value).replace(",", ".").trim());

  return Number.isFinite(num) ? num : null;
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
  defaultCoverPrice = null,
  coverPriceByVolume = {},
  editionLabel = "",
  author = "",
  genre = "",
  addedAtByVolume = {},
  format = "",
}) {
  const normalizedDefaultCoverPrice = normalizePrice(defaultCoverPrice);

  return Array.from({ length: end - start + 1 }, (_, i) => {
    const volume = start + i;
    const vv = pad2(volume);

    const titleBase = editionLabel
      ? `${series} – ${editionLabel} Vol. ${vv}`
      : `${series} Vol. ${vv}`;

    const finalFormat = format || editionLabel || "";

    const coverPrice =
      normalizePrice(coverPriceByVolume?.[volume]) ??
      normalizedDefaultCoverPrice;

    return {
      id: `${prefix}-${vv}`,
      series,
      volume,
      title: titleBase,

      brand: (brand || "").trim(),
      author: (author || "").trim(),
      genre: (genre || "").trim(),

      authorList: splitMulti(author),
      genreList: splitMulti(genre),
      format: finalFormat.trim(),

      image: img(`${prefix}${vv}.${imageExt}`),

      affiliate: normalizeAffiliate(affiliateByVolume[volume]),
      tiktokUrl: tiktokByVolume[volume] || "",
      description: descriptionByVolume[volume] || "",
      addedAt: addedAtByVolume[volume] || null,

      // preço de capa / tabela da obra
      coverPrice,
    };
  });
}