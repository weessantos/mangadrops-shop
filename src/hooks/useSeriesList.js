// ============================================================================
// src/hooks/useSeriesList.js
// ============================================================================
//
// RESPONSABILIDADE DESTE HOOK
// ----------------------------------------------------------------------------
// Centraliza a criação e processamento da lista de séries.
//
// Ele é responsável por:
//
// ✅ Agrupar produtos por série
// ✅ Enriquecer dados usando catálogo
// ✅ Calcular volumes disponíveis
// ✅ Calcular volumes faltantes
// ✅ Gerar status da coleção
// ✅ Gerar slug
// ✅ Criar mapeamento slug → série
//
//
//
// O QUE ESTE HOOK NÃO DEVE FAZER
// ----------------------------------------------------------------------------
//
// ❌ Não deve acessar API
// ❌ Não deve acessar Supabase
// ❌ Não deve montar imagens manualmente
// ❌ Não deve renderizar componentes
// ❌ Não deve acessar DOM
//
// ============================================================================

import { useMemo } from "react";

import {
  computeMissing,
  slugify,
  uniqueSortedAvailableVolumes,
} from "../utils/search";

import { img } from "../utils/images";

export function useSeriesList(products, seriesCatalog) {
  // ==========================================================================
  // MAPA DE CATÁLOGO
  // ==========================================================================
  //
  // RESPONSABILIDADE
  // --------------------------------------------------------------------------
  // Facilita busca por nome:
  //
  // "One Piece"
  // → objeto catálogo
  //
  // ==========================================================================

  const catalogMap = useMemo(() => {
    const map = new Map();

    for (const s of seriesCatalog) {
      map.set(s.name, s);
    }

    return map;
  }, [seriesCatalog]);

  // ==========================================================================
  // LISTA DE SÉRIES
  // ==========================================================================
  //
  // RESPONSABILIDADE
  // --------------------------------------------------------------------------
  //
  // Agrupa produtos e gera:
  //
  // - nome
  // - thumb
  // - status
  // - volumes faltantes
  // - labels
  //
  // ==========================================================================

  const seriesList = useMemo(() => {
    const groups = new Map();

    // =========================
    // Agrupa produtos
    // =========================

    for (const p of products.filter((p) => p.parent_series_id === null)) {
      const key =
        p.series ||
        p.series_title ||
        (p.prefix ? p.prefix.toUpperCase() : null) ||
        "Outros";

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(p);
    }

    return (
      Array.from(groups.entries())
        .map(([name, items]) => {
          const first = items[0];

          // =========================
          // Dados catálogo
          // =========================

          const cat = catalogMap.get(name) || {};

          const totalRaw = first?.total_volumes ?? cat.total_volumes;

          const total = Number.isFinite(Number(totalRaw))
            ? Number(totalRaw)
            : null;

          // =========================
          // Volumes disponíveis
          // =========================

          const vols = uniqueSortedAvailableVolumes(items);

          const haveCount = vols.length;

          const rangeLabel = total ? `Vol. 1–${total}` : "Volumes";

          const haveLabel = total
            ? `Disponível ${haveCount}/${total}`
            : `${haveCount} volume(s)`;

          // =========================
          // Volumes faltantes
          // =========================

          const missing = total ? computeMissing(vols, total) : [];

          const missingCount = missing.length;

          const statusLabel = total
            ? missingCount === 0
              ? "Completo ✅"
              : `Sem estoque (${missingCount})`
            : "Defina totalVolumes";

          return {
            name,

            // usado pela busca/aliases
            prefix: first?.prefix,

            slug: slugify(name),

            thumb:
              first?.thumb ||
              cat.thumb ||
              img({
                prefix: "default-series.webp",
              }),

            subtitle: cat.subtitle || "Clique para ver os volumes disponíveis.",

            rangeLabel,
            haveLabel,
            statusLabel,

            missing,
            missingCount,
          };
        })

        // =========================
        // Ordenação
        // =========================

        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }, [products, catalogMap]);

  // ==========================================================================
  // MAPA SLUG → SÉRIE
  // ==========================================================================
  //
  // EX:
  //
  // one-piece
  // → One Piece
  //
  // ==========================================================================

  const seriesBySlug = useMemo(() => {
    const map = new Map();

    for (const s of seriesList) {
      map.set(s.slug, s.name);
    }

    return map;
  }, [seriesList]);

  // ==========================================================================
  // LISTA SIMPLES DE NOMES
  // ==========================================================================
  //
  // EX:
  //
  // [
  //   "One Piece",
  //   "Chainsaw Man"
  // ]
  //
  // ==========================================================================

  const seriesNames = useMemo(
    () =>
      seriesList.map((s) => ({
        name: s.name,
        prefix: s.prefix,
      })),

    [seriesList],
  );

  return {
    seriesList,
    seriesBySlug,
    seriesNames,
  };
}
