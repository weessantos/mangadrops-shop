export function normalizeProduct(p) {
  function slugify(str) {
    return str
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const base = import.meta.env.BASE_URL;

  // 🔢 número seguro
  const volumeNumber = Number(p.number);

  const paddedNumber =
    Number.isFinite(volumeNumber)
      ? String(volumeNumber).padStart(2, "0")
      : null;

  // 🖼 imagem do volume
  const volumeImage =
    p.prefix && paddedNumber
      ? `${base}assets/${p.prefix}${paddedNumber}.webp`
      : null;

  // 🔥 SLUGS
  const seriesSlug = slugify(p.series_title);

  const volumeSlug =
    p.prefix && paddedNumber
      ? `${p.prefix}-${paddedNumber}`
      : null;

  const url =
    seriesSlug && volumeSlug
      ? `/${seriesSlug}/${volumeSlug}`
      : null;

  return {
    ...p,

    // 🔥 IDENTIDADE
    id: volumeSlug || `${p.prefix}-${p.number}` || crypto.randomUUID(),

    // 🔥 TÍTULO
    title: p.volume_title,

    // 🔥 SÉRIE
    series: p.series_title,

    // 🔥 PREFIX (IMPORTANTE PRA URL)
    prefix: p.prefix,

    // 🔥 VOLUME SEGURO
    volume: Number.isFinite(volumeNumber) ? volumeNumber : null,

    // 🔥 PREÇOS
    coverPrice: p.cover_price,
    best_price: p.best_price,

    // 🔥 IMAGEM
    image:
      volumeImage ||
      (p.thumb ? `${base}${p.thumb}` : null) ||
      "/placeholder.png",

    // 🔥 LINKS
    affiliate: {
      amazon: p.amazon,
      mercadoLivre: p.mercado_livre,
    },

    // 🔥 PREÇOS LOJAS
    amazonPrice: p.amazon_price,
    mlPrice: p.mercado_livre_price,

    // 🔥 OUTROS
    brand: p.brand,
    genre: p.genre,
    format: p.format,
    author: p.author,
    discount: p.discount,
    addedAt: p.added_at,

    // 🧭 SLUGS E URL (GARANTIDO)
    seriesSlug,
    volumeSlug,
    url,
  };
}