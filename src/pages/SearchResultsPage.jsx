// ============================================================================
// SearchResultsPage.jsx
// ============================================================================
//
// RESPONSABILIDADE DESTE ARQUIVO
// ----------------------------------------------------------------------------
// Esta página é responsável EXCLUSIVAMENTE por renderizar os resultados
// vindos do sistema de busca.
//
// Responsabilidades:
//
// ✅ Mostrar a query atual
// ✅ Mostrar quantidade de resultados encontrados
// ✅ Renderizar produtos encontrados
// ✅ Controlar botão "Carregar mais"
// ✅ Exibir banner padrão das páginas do projeto
//
//
//
// O QUE ESTE ARQUIVO NÃO DEVE FAZER
// ----------------------------------------------------------------------------
//
// ❌ Não faz parse da busca
// ❌ Não detecta séries
// ❌ Não usa aliases
// ❌ Não faz busca fuzzy
// ❌ Não aplica filtros
// ❌ Não acessa URL
//
// Toda a inteligência da busca já aconteceu antes:
//
// Header
// ↓
// parseQuery()
// ↓
// pickSeriesFromQuery()
// ↓
// baseFiltered
// ↓
// filtered
// ↓
// pagedProducts
// ↓
// SearchResultsPage ← aqui só renderiza
//
// ============================================================================

import { useNavigate } from "react-router-dom";

import ProductGrid from "../components/ProductGrid";
import { PageHero } from "../components/CollectionHero";
import ActiveFiltersBar from "../components/ActiveFiltersBar";

import "../styles/product-grid.css";

export default function SearchResultsPage({
  products = [],
  hasMore = false,
  setPage,
  openProduct,
  qParam = "",
}) {
  const navigate = useNavigate();

  return (
    <section className="pageSection searchResultsPage">
      {/* ==========================================================
          HERO / BANNER
      ========================================================== */}

      <PageHero
        title="Filtros 🔎"
        subtitle={`Pesquisando por: "${qParam}"`}
        total={products.length}
        background="/search-bg.jpeg"
        backLabel="← Voltar"
        onBack={() => navigate(-1)}
      />

      {/* ==========================================================
          FILTROS ATIVOS
      ========================================================== */}

      <ActiveFiltersBar />

      {/* ==========================================================
          ESTADO VAZIO
      ========================================================== */}

      {!products.length && (
        <div className="emptySearch">
          <h3>Nenhum resultado encontrado</h3>

          <p>Tente pesquisar por:</p>

          <ul>
            <li>Nome da obra</li>
            <li>Volume específico</li>
            <li>Siglas (JJK, AOT)</li>
          </ul>
        </div>
      )}

      {/* ==========================================================
          RESULTADOS
      ========================================================== */}

      {products.length > 0 && (
        <ProductGrid
          title={`Busca: ${qParam}`}
          subtitle={`${products.length} resultado(s) encontrados`}
          items={products}
          onOpen={openProduct}
        />
      )}

      {/* ==========================================================
          PAGINAÇÃO / LOAD MORE
      ========================================================== */}

      {hasMore && (
        <div className="searchLoadMore">
          <button
            className="loadMoreBtn"
            onClick={() => setPage((prev) => prev + 1)}
          >
            <span>Carregar mais volumes</span>

            <small>{products.length} exibidos</small>
          </button>
        </div>
      )}
    </section>
  );
}
