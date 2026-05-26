// ============================================================================
// sortProducts
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Ordena produtos respeitando:
//
// ✅ obra principal antes dos extras
// ✅ agrupamento por série
// ✅ ordenação de volumes
// ✅ preço
// ✅ recentes
//
// ============================================================================

export function sortProducts(products, sortBy = "az") {
  return [...products].sort((a, b) => {
    switch (sortBy) {
      case "priceAsc":
        return Number(a.best_price || 99999) -
          Number(b.best_price || 99999);

      case "priceDesc":
        return Number(b.best_price || 0) -
          Number(a.best_price || 0);

      case "recent":
        return new Date(b.addedAt || 0) -
          new Date(a.addedAt || 0);

      case "volumeDesc":
      case "az":
      default: {
        const aExtra = !!a.parent_series_id;
        const bExtra = !!b.parent_series_id;

        // principal primeiro
        if (aExtra !== bExtra) {
          return aExtra ? 1 : -1;
        }

        // agrupa alfabeticamente
        const seriesCompare =
          (a.series || "").localeCompare(
            b.series || "",
            "pt-BR"
          );

        if (seriesCompare !== 0) {
          return seriesCompare;
        }

        // volumes dentro do grupo
        return sortBy === "volumeDesc"
          ? Number(b.volume || 0) - Number(a.volume || 0)
          : Number(a.volume || 0) - Number(b.volume || 0);
      }
    }
  });
}