import prices from "../data/prices.json";

export function getPriceEntry(productId) {
  return prices?.[productId] ?? null;
}

export function getPrice(productId, store) {
  return prices?.[productId]?.[store] ?? null;
}

export function getUpdatedAt(productId) {
  return prices?.[productId]?.updatedAt ?? null;
}

export function formatPrice(value) {
  if (value == null || !Number.isFinite(value)) return null;

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function getBestPrice(productId) {
  const entry = getPriceEntry(productId);
  if (!entry) return null;

  const options = [
    { store: "mercadoLivre", value: entry.mercadoLivre },
    { store: "amazon", value: entry.amazon },
  ].filter((item) => item.value != null && Number.isFinite(item.value));

  if (!options.length) return null;

  return options.reduce((best, current) =>
    current.value < best.value ? current : best
  );
}

export function getAvailablePrices(productId) {
  const entry = getPriceEntry(productId);
  if (!entry) return [];

  return [
    {
      store: "mercadoLivre",
      label: "Mercado Livre",
      value: entry.mercadoLivre ?? null,
      formatted: formatPrice(entry.mercadoLivre ?? null),
    },
    {
      store: "amazon",
      label: "Amazon",
      value: entry.amazon ?? null,
      formatted: formatPrice(entry.amazon ?? null),
    },
  ].filter((item) => item.value != null && Number.isFinite(item.value));
}