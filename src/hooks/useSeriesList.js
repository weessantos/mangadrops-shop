// src/hooks/useSeriesList.js
import { useMemo } from "react";
import {
  computeMissing,
  slugify,
  uniqueSortedAvailableVolumes,
} from "../utils/search";

export function useSeriesList(products, seriesCatalog) {
  const catalogMap = useMemo(() => {
    const map = new Map();
    for (const s of seriesCatalog) map.set(s.name, s);
    return map;
  }, [seriesCatalog]);

  const seriesList = useMemo(() => {
    const groups = new Map();

    for (const p of products) {
      const key =
        p.series ||
        p.series_title ||
        (p.prefix ? p.prefix.toUpperCase() : null) ||
        "Outros";

      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    }

    return Array.from(groups.entries())
      .map(([name, items]) => {
        const first = items[0];

        // 🔥 dados do catálogo
        const cat = catalogMap.get(name) || {};

        const totalRaw =
          first?.total_volumes ?? // 🔥 vindo do banco (correto)
          cat.total_volumes;   // fallback (se tiver)

        const total = Number.isFinite(Number(totalRaw))
          ? Number(totalRaw)
          : null;
        const vols = uniqueSortedAvailableVolumes(items);
        const haveCount = vols.length;

        const rangeLabel = total ? `Vol. 1–${total}` : "Volumes";

        const haveLabel = total
          ? `Disponível ${haveCount}/${total}`
          : `${haveCount} volume(s)`;

        const missing = total ? computeMissing(vols, total) : [];
        const missingCount = missing.length;

        const statusLabel = total
          ? missingCount === 0
            ? "Completo ✅"
            : `Sem estoque (${missingCount})`
          : "Defina totalVolumes";

        return {
          name,
          slug: slugify(name),

          // 🔥 agora usa thumb do banco primeiro
          thumb:
            first?.thumb ||
            cat.thumb ||
            "/assets/default-series.webp",

          subtitle:
            cat.subtitle ||
            "Clique para ver os volumes disponíveis.",

          rangeLabel,
          haveLabel,
          statusLabel,
          missing,
          missingCount,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, catalogMap]);

  const seriesBySlug = useMemo(() => {
    const map = new Map();
    for (const s of seriesList) map.set(s.slug, s.name);
    return map;
  }, [seriesList]);

  const seriesNames = useMemo(
    () => seriesList.map((s) => s.name),
    [seriesList]
  );

  return { seriesList, seriesBySlug, seriesNames };
}