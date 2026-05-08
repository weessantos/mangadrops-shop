import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import CollectionHero, { PageHero } from "../components/CollectionHero.jsx";
import { getReleases } from "../utils/getReleases";
import "../styles/product-grid.css";

export default function ReleasesPage({ products = [], onOpenProduct }) {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const windowWidth = window.innerWidth;
  const PAGE_SIZE = windowWidth >= 500 && windowWidth <= 700 ? 18 : 20;

  // 🔥 FILTRO
  const releases = useMemo(() => {
    return getReleases(products);
  }, [products]);

  // 🔥 PAGINAÇÃO
  const paginatedReleases = useMemo(() => {
    return releases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [releases, page]);

  const totalPages = Math.ceil(releases.length / PAGE_SIZE);

  // 🔥 RESETA PÁGINA quando muda produtos
  useEffect(() => {
    setPage(1);
  }, [products]);

  // SCROLL

  const topRef = useRef(null);

  useEffect(() => {
    if (!topRef.current) return;

    const yOffset = -80; // ajuste se tiver header fixo
    const y =
      topRef.current.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }, [page]);

  return (
    <section className="pageSection" ref={topRef}>
      <PageHero
        title="Lançamentos 🔥"
        subtitle="Atualizado com lançamentos e reposições recentes."
        total={releases.length}
        background="releases-bg.jpeg"
        onBack={() => navigate("/")}
      />

      <ProductGrid
        title="Lançamentos 🔥"
        subtitle="Atualizado com lançamentos e reposições recentes."
        items={paginatedReleases}
        onOpen={onOpenProduct}
      />

      <div className="pagination">
        <button
          className="paginationArrow"
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 1}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M15 6L9 12L15 18"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          className="paginationArrow"
          onClick={() => setPage((p) => p + 1)}
          disabled={page === totalPages}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
