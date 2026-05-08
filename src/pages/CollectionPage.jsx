import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CollectionHero from "../components/CollectionHero";
import ProductCard from "../components/ProductCard";

export default function CollectionPage({
  activeSeries = "",

  filtered = [],
  pagedProducts = [],

  pageSize = 20,
  hasMore = false,

  setPage,

  openProduct,
  clearSeries,

  collectionsSectionRef,
}) {
  const navigate = useNavigate();

  const { seriesSlug } = useParams();

  // 🔥 SCROLL TOP

  const topRef = useRef(null);

  useEffect(() => {
    if (!topRef.current) return;

    const yOffset = -80;

    const y =
      topRef.current.getBoundingClientRect().top +
      window.scrollY +
      yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }, []);

  return (
    <section
      className="collectionsSection"
      id="railTitle"
      ref={collectionsSectionRef}
    >
      <CollectionHero
        seriesSlug={seriesSlug}
        title={activeSeries}
        total={filtered.length}
        onBack={clearSeries}
      />

      <section
        className="volumesSection"
        ref={topRef}
      >
        <section className="grid">
          {pagedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onOpen={openProduct}
            />
          ))}
        </section>

        {hasMore && (
          <div className="showMoreRow">
            <button
              className="btn showMoreBtn"
              onClick={() =>
                setPage((prev) => prev + 1)
              }
            >
              Mostrar mais {pageSize}
            </button>

            <div className="showMoreHint">
              Exibindo{" "}
              {pagedProducts.length}/
              {filtered.length}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}