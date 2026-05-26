// ============================================================================
// src/components/CollectionHero.jsx
// ============================================================================
//
// RESPONSABILIDADE DESTE ARQUIVO
// ----------------------------------------------------------------------------
// Renderiza os heróis (banners) das páginas:
//
// ✅ Página de coleção específica
// ✅ Página de coleções
// ✅ Página genérica
//
//
//
// O QUE ESTE ARQUIVO NÃO DEVE FAZER
// ----------------------------------------------------------------------------
//
// ❌ Não deve montar caminhos manualmente
// ❌ Não deve conhecer assets
// ❌ Não deve construir URLs
//
// Toda resolução de imagem acontece em:
// utils/images.js
//
// ============================================================================

import "../styles/collection-hero.css";
import { img } from "../utils/images";

// ============================================================================
// HERO DA COLEÇÃO
// ============================================================================
//
// Ex:
//
// Chainsaw Man
// One Piece
//
// ============================================================================

export default function CollectionHero({
  seriesSlug,
  title,
  total,
  onBack,
}) {
  return (
    <section
      id="collection-hero"
      className="collectionHero"
      style={{
        backgroundImage: `url(${
          img({
            prefix: seriesSlug,
            file: `${seriesSlug}.jpeg`,
          })
        })`,
      }}
    >
      <div className="heroOverlay">
        <button
          className="heroBackBtn"
          onClick={onBack}
        >
          ← Voltar para obras
        </button>

        <h1>{title}</h1>

        <p>
          Explore todos os volumes
          disponíveis dessa coleção.
        </p>

        <div className="heroMeta">
          <span>
            📚 {total} volumes
          </span>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HERO DE COLEÇÕES
// ============================================================================
//
// Ex:
//
// Página:
//
// /colecoes
//
// ============================================================================

export function CollectionsHero({
  total,
  onBack,
}) {
  return (
    <section
      id="collection-hero"
      className="collectionHero"
      style={{
        backgroundImage: `url(${
          img({
            prefix: "collections-bg.jpeg",
          })
        })`,
      }}
    >
      <div className="heroOverlay">
        <button
          className="heroBackBtn"
          onClick={onBack}
        >
          ← Voltar para obras
        </button>

        <h1>Coleções</h1>

        <p>
          Explore todas as obras
          disponíveis.
        </p>

        <div className="heroMeta">
          <span>
            📚 {total}{" "}
            {total === 1
              ? "obra"
              : "obras"}
          </span>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HERO GENÉRICO
// ============================================================================
//
// Ex:
//
// Promoções
// Lançamentos
// Saldão
//
// ============================================================================

export function PageHero({
  title,
  subtitle,
  total,
  tag,
  background,
  onBack,
}) {
  return (
    <section
      id="collection-hero"
      className="collectionHero"
      style={{
        backgroundImage: `url(${
          img({
            prefix: background,
          })
        })`,
      }}
    >
      <div className="heroOverlay">
        <button
          className="heroBackBtn"
          onClick={onBack}
        >
          ← Voltar para Home 🏠"
        </button>

        <span className="heroTag">
          {tag}
        </span>

        <h1>{title}</h1>

        <p>{subtitle}</p>

        <div className="heroMeta">
          <span>
            📚 {total} itens
          </span>
        </div>
      </div>
    </section>
  );
}