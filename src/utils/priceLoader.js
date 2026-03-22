import prices from "../data/prices.json";

// 🔒 garante número válido
function toNumber(value) {
  if (value === null || value === undefined) return null;

  if (typeof value === "string" && value.trim() === "") {
    return null;
  }

  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// 📦 pega entrada completa
export function getPriceEntry(product) {
  if (!product?.id) return null;
  return prices?.[product.id] ?? null;
}

// 💰 pega preço por loja
export function getPrice(product, store) {
  if (!product?.id) return null;
  return toNumber(prices?.[product.id]?.[store]);
}

// 🕒 última atualização
export function getUpdatedAt(product) {
  if (!product?.id) return null;
  return prices?.[product.id]?.updatedAt ?? null;
}

// 💵 formatador
export function formatPrice(value) {
  const n = toNumber(value);
  if (n == null) return null;

  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// 🏆 melhor preço
export function getBestPrice(product) {
  const entry = getPriceEntry(product);
  if (!entry) return null;

  const options = [
    { store: "mercadoLivre", value: toNumber(entry.mercadoLivre) },
    { store: "amazon", value: toNumber(entry.amazon) },
  ].filter((item) => item.value != null);

  if (!options.length) return null;

  return options.reduce((best, current) =>
    current.value < best.value ? current : best
  );
}

// 📊 lista de preços
export function getAvailablePrices(product) {
  const entry = getPriceEntry(product);
  if (!entry) return [];

  return [
    {
      store: "mercadoLivre",
      label: "Mercado Livre",
      value: toNumber(entry.mercadoLivre),
      formatted: formatPrice(entry.mercadoLivre),
    },
    {
      store: "amazon",
      label: "Amazon",
      value: toNumber(entry.amazon),
      formatted: formatPrice(entry.amazon),
    },
  ].filter((item) => item.value != null);
}