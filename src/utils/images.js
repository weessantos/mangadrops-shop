// ============================================================================
// src/utils/images.js
// ============================================================================
//
// RESPONSABILIDADE DESTE ARQUIVO
// ----------------------------------------------------------------------------
// Centraliza TODA a geração de caminhos de imagem do projeto.
//
// Ele é responsável por:
//
// ✅ Construir caminhos de imagens
// ✅ Resolver obras principais
// ✅ Resolver novels / databooks / spin-offs
// ✅ Resolver hierarquia pai → filho
// ✅ Respeitar BASE_URL do Vite
//
//
//
// O QUE ESTE ARQUIVO NÃO DEVE FAZER
// ----------------------------------------------------------------------------
//
// ❌ Não deve acessar Supabase
// ❌ Não deve buscar imagens
// ❌ Não deve usar React
// ❌ Não deve acessar DOM
// ❌ Não deve conhecer componentes
//
//
//
// ESTRUTURA DE PASTAS
// ----------------------------------------------------------------------------
//
// Obra principal:
//
// assets/op/op01.webp
// assets/op/op02.webp
//
//
//
// Obras derivadas:
//
// assets/op/op-databook/op-databook01.webp
//
// assets/op/op-novelA/op-novelA01.webp
//
// assets/op/op-episodeA/op-episodeA01.webp
//
//
//
// REGRAS
// ----------------------------------------------------------------------------
//
// Série principal:
//
// parentPrefix = null
//
// caminho:
//
// /assets/op/op01.webp
//
//
//
// Série derivada:
//
// parentPrefix = "op"
//
// caminho:
//
// /assets/op/op-novelA/op-novelA01.webp
//
// ============================================================================

// ============================================================================
// BASE URL
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Compatibilidade com:
//
// - localhost
// - Vite
// - deploy em subpastas
//
// ============================================================================

const base =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.BASE_URL
    ? import.meta.env.BASE_URL
    : "/";

// ============================================================================
// PREFIXO SEGURO
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Normaliza prefixos vindos do banco.
//
// EX:
//
// "Fri"
// → "fri"
//
// "OP"
// → "op"
//
// ============================================================================

function safePrefix(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Normaliza prefixos vindos do banco.
//
// Protege contra inconsistências:
//
// "Fri"
// "FRI"
// "fri"
//
// Todos viram:
//
// → fri
//
// Evita problemas com:
//
// - nomes de pasta
// - caminhos de imagens
// - diferenças entre Windows/Linux
//
// ============================================================================

function safeFile(file, prefix) {
  if (!file) return file;

  const safe = safePrefix(prefix);

  return String(file).replace(new RegExp(`^${prefix}`, "i"), safe);
}

// ============================================================================
// img
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Gera o caminho completo de uma imagem.
//
// Recebe:
//
// - prefix
// - parentPrefix
// - file
//
//
//
// EXEMPLOS
// ----------------------------------------------------------------------------
//
// Série principal:
//
// img({
//   prefix: "op",
//   file: "op01.webp"
// })
//
// → /assets/op/op01.webp
//
//
//
// Série derivada:
//
// img({
//   prefix: "op-novelA",
//   parentPrefix: "op",
//   file: "op-novelA01.webp"
// })
//
// → /assets/op/op-novelA/op-novelA01.webp
//
// ============================================================================

export function img({ prefix, parentPrefix = null, file }) {
  // =========================
  // Prefixos seguros
  // =========================

  const safeCurrent = safePrefix(prefix);

  const safeParent = parentPrefix ? safePrefix(parentPrefix) : null;

  const safeFileName = safeFile(file, prefix);

  const root = safeParent || safeCurrent;

  // ============================================================================
  // IMAGEM GLOBAL
  // ============================================================================
  //
  // Permite:
  //
  // img({
  //   prefix: "amazon.svg"
  // })
  //
  // → /assets/amazon.svg
  //
  //
  // img({
  //   prefix: "hero-banner",
  //   file: "op-banner.jpeg"
  // })
  //
  // → /assets/hero-banner/op-banner.jpeg
  //
  // ============================================================================

  if (!safeParent && file) {
    return `${base}assets/${safeCurrent}/${safeFileName}`;
  }

  if (!file) {
    return `${base}assets/${safeCurrent}`;
  }

  // =========================
  // Série principal
  // =========================

  if (!safeParent) {
    return `${base}assets/${root}/${safeFileName}`;
  }

  // =========================
  // Série derivada
  // =========================

  return `${base}assets/${root}/${safeCurrent}/${safeFileName}`;
}
