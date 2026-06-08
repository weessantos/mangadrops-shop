import { Helmet } from "react-helmet-async";
import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import { getPromotions } from "../utils/getPromotions";
import CollectionHero, { PageHero } from "../components/CollectionHero.jsx";
import "../styles/product-grid.css";

export default function PromotionsPage({ products = [], onOpenProduct }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const windowWidth = window.innerWidth;
  const PAGE_SIZE = windowWidth >= 500 && windowWidth <= 700 ? 18 : 20;

  // 🔥 FILTRO
  const promotions = useMemo(() => {
    return getPromotions(products);
  }, [products]);

  // 🔥 PAGINAÇÃO
  const paginatedPromotions = useMemo(() => {
    return promotions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [promotions, page]);

  const totalPages = Math.ceil(promotions.length / PAGE_SIZE);

  // 🔥 RESETA PÁGINA
  useEffect(() => {
    setPage(1);
  }, [products]);

  // 🔥 SCROLL TOP

  const topRef = useRef(null);

  useEffect(() => {
    if (!topRef.current) return;

    const yOffset = -80;

    const y =
      topRef.current.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }, [page]);

  return (
    <>
      <Helmet>
        <title>Promoções de Mangás | Mangá Drops</title>

        <meta
          name="description"
          content="Encontre ofertas e promoções atualizadas em mangás de diversas editoras."
        />
      </Helmet>
      <section className="pageSection" ref={topRef}>
        <PageHero
          title="Promoções 💸"
          subtitle="Mangás com 40% OFF ou mais."
          total={promotions.length}
          background="promotions-bg.jpeg"
          onBack={() => navigate("/")}
        />

        <ProductGrid
          title="Promoções 💸"
          subtitle="Mangás com desconto e oportunidades."
          items={paginatedPromotions}
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
    </>
  );
}
