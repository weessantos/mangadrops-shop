import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import CollectionHero from "../components/CollectionHero";
import ProductCard from "../components/ProductCard";

/**
 * ======================================================
 * COLLECTION PAGE
 * ======================================================
 *
 * Responsabilidades:
 *
 * - Exibir coleção atual
 * - Separar obra principal e extras
 * - Controlar abas
 * - Ordenação
 * - Paginação independente por aba
 *
 * Não faz:
 *
 * - Busca no banco
 * - Montagem de catálogo
 *
 * ======================================================
 */

export default function CollectionPage({
  activeSeries = "",
  filtered = [],
  pageSize = 10,

  openProduct,
  clearSeries,

  collectionsSectionRef,
}) {
  const { seriesSlug } = useParams();

  // =========================
  // CONTROLE DAS ABAS
  // =========================

  const [activeTab, setActiveTab] = useState("main");

  // =========================
  // ORDENAÇÃO
  // =========================

  const [sortBy, setSortBy] = useState("az");

  // =========================
  // PAGINAÇÃO
  // Cada aba tem sua própria
  // contagem
  // =========================

  const [mainPage, setMainPage] = useState(1);

  const [extraPage, setExtraPage] = useState(1);

  // =========================
  // SCROLL
  // =========================

  const topRef = useRef(null);

  useEffect(() => {
    if (!topRef.current) return;

    const y = topRef.current.getBoundingClientRect().top + window.scrollY - 80;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }, []);

  // =========================
  // SEPARAÇÃO
  // =========================

  const mainProducts = filtered.filter((p) => !p.parent_series_id);

  const extraProducts = filtered.filter((p) => p.parent_series_id);

  // =========================
  // PRODUTOS DA ABA
  // =========================

  const selectedProducts = activeTab === "main" ? mainProducts : extraProducts;

  // =========================
  // ORDENAÇÃO
  // Ordena TUDO primeiro
  // =========================

  const sortedProducts = [...selectedProducts].sort((a, b) => {
    switch (sortBy) {
      case "volumeDesc":
        return Number(b.volume || 0) - Number(a.volume || 0);

      case "priceAsc":
        return Number(a.best_price || 99999) - Number(b.best_price || 99999);

      case "priceDesc":
        return Number(b.best_price || 0) - Number(a.best_price || 0);

      case "recent":
        return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);

      // padrão:
      // Episode A Vol01
      // Episode A Vol02
      // Novel A Vol01
      // Novel A Vol02

      case "az":
      default:
        return (
          (a.series || "").localeCompare(b.series || "", "pt-BR") ||
          Number(a.volume || 0) - Number(b.volume || 0)
        );
    }
  });

  // =========================
  // PAGINAÇÃO
  // aplicada DEPOIS
  // =========================

  const currentPage = activeTab === "main" ? mainPage : extraPage;

  const displayedProducts = sortedProducts.slice(0, currentPage * pageSize);

  const hasMore = displayedProducts.length < selectedProducts.length;

  return (
    <section
      className="collectionsSection"
      id="railTitle"
      ref={collectionsSectionRef}
    >
      <CollectionHero
        seriesSlug={seriesSlug}
        title={activeSeries}
        total={selectedProducts.length}
        onBack={clearSeries}
      />

      {/* ================= */}
      {/* TABS */}
      {/* ================= */}

      <section className="collectionTabs">
        <button
          className={`collectionTab ${activeTab === "main" ? "active" : ""}`}
          onClick={() => setActiveTab("main")}
        >
          📚 Obra Principal
          <span>{mainProducts.length} volumes</span>
        </button>

        <button
          className={`collectionTab ${activeTab === "extras" ? "active" : ""}`}
          onClick={() => setActiveTab("extras")}
        >
          📖 Extras da Coleção
          <span>{extraProducts.length} relacionados</span>
        </button>
      </section>

      {/* ================= */}
      {/* ORDENAÇÃO */}
      {/* ================= */}

      <section className="collectionControls">
        <span className="sortLabel">Ordenar:</span>

        <select
          className="collectionSort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="az">A → Z</option>

          <option value="volumeDesc">Z → A</option>

          <option value="priceAsc">Menor preço</option>

          <option value="priceDesc">Maior preço</option>

          <option value="recent">Recentes</option>
        </select>
      </section>

      {/* ================= */}
      {/* GRID */}
      {/* ================= */}

      <section className="volumesSection" ref={topRef}>
        <section className="grid">
          {displayedProducts.map((p) => (
            <ProductCard key={p.id} product={p} onOpen={openProduct} />
          ))}
        </section>

        {/* ================= */}
        {/* MOSTRAR MAIS */}
        {/* ================= */}

        {hasMore && (
          <div className="showMoreRow">
            <button
              className="btn showMoreBtn"
              onClick={() => {
                if (activeTab === "main") {
                  setMainPage((prev) => prev + 1);
                } else {
                  setExtraPage((prev) => prev + 1);
                }
              }}
            >
              Mostrar mais {pageSize}
            </button>

            <div className="showMoreHint">
              Exibindo {displayedProducts.length}/{selectedProducts.length}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
