// ============================================================================
// src/data/products/index.js
// ============================================================================
//
// RESPONSABILIDADE DESTE ARQUIVO
// ----------------------------------------------------------------------------
// Centraliza a obtenção dos produtos do projeto.
//
// Ele é responsável por:
//
// ✅ Buscar produtos no Supabase
// ✅ Adaptar API → formato interno
// ✅ Resolver imagens via util central
// ✅ Padronizar estrutura dos produtos
// ✅ Aplicar filtros simples
//
//
//
// O QUE ESTE ARQUIVO NÃO DEVE FAZER
// ----------------------------------------------------------------------------
//
// ❌ Não deve usar React
// ❌ Não deve acessar DOM
// ❌ Não deve renderizar componentes
// ❌ Não deve montar caminhos de imagem manualmente
// ❌ Não deve conter lógica visual
//
// ============================================================================

import { supabaseClient } from "../../lib/supabase";
import { img } from "../../utils/images";

// ============================================================================
// pad2
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Adiciona zero à esquerda.
//
// EX:
//
// 1 → 01
// 8 → 08
// 15 → 15
//
// ============================================================================

function pad2(n) {
  return String(n).padStart(2, "0");
}

// ============================================================================
// mapApiProduct
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Converte o formato retornado pelo Supabase
// para o formato utilizado internamente pelo site.
//
// API
//
// {
//   series_title: "...",
//   number: 1
// }
//
// ↓
//
// PRODUTO
//
// {
//   title: "...",
//   image: "..."
// }
//
// ============================================================================

function mapApiProduct(v) {
  const vv = pad2(v.number);

  return {
    id: `${v.prefix}-${vv}`,

    prefix: v.prefix,

    title: `${v.series_title} Vol. ${vv}`,

    total_volumes: v.total_volumes,

    // essenciais para busca / filtros
    series: v.series_title,
    volume: v.number,

    // =========================
    // IMAGEM
    // =========================

    image: img({
      prefix: v.prefix,
      parentPrefix: v.parent_prefix,
      file: `${v.prefix}${vv}.webp`,
    }),

    thumb: v.thumb,

    brand: v.brand,
    author: v.author,
    genre: v.genre,
    format: v.format,

    coverPrice: v.cover_price,

    discount:
      Number(v.discount) || 0,

    parent_series_id:
      v.parent_series_id,

    content_type:
      v.content_type,

    description:
      v.description,

    tiktokUrl:
      v.tiktok,

    addedAt:
      v.added_at,

    affiliate: {
      amazon:
        v.amazon,

      mercadoLivre:
        v.mercado_livre,
    },
  };
}

// ============================================================================
// getProducts
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Busca produtos no banco
// e retorna uma lista padronizada.
//
// EX:
//
// const products = await getProducts();
//
// const products = await getProducts(
//   "one piece"
// );
//
// ============================================================================

export async function getProducts(search = "") {
  const { data, error } =
    await supabaseClient
      .from("series_volumes_view")
      .select("*");

  if (error) {
    console.error(
      "Erro ao buscar produtos:",
      error,
    );

    return [];
  }

  const products =
    data.map(mapApiProduct);

  // =========================
  // FILTRO DE BUSCA
  // =========================

  if (search) {
    return products.filter((p) =>
      p.title
        .toLowerCase()
        .includes(
          search.toLowerCase(),
        ),
    );
  }

  return products;
}