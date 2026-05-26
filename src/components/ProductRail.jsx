import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import "../styles/product-rail.css";

export default function ProductRail({
  sectionId,
  title,
  subtitle,
  titleClassName = "",
  subtitleClassName = "",
  items = [],
  initialVisible = 20,
  viewAllLink = "/",
  onOpenProduct,
}) {
  const railRef = useRef(null);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const visibleItems = items.slice(0, initialVisible);

  const updateArrows = () => {
    const el = railRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;

    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < maxScroll - 2);
  };

  useEffect(() => {
    updateArrows();

    const el = railRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [items.length]);

  const scroll = (dir) => {
    const el = railRef.current;
    if (!el) return;

    el.scrollBy({
      left: el.clientWidth * 0.85 * dir,
      behavior: "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section className="railSection">
      <div className="railBlock">
        <div className="sectionHeader">
          <div>
            <h2 className={titleClassName}>{title}</h2>
            {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
          </div>

          <div className="sectionHeaderRight">
            <span>
              {visibleItems.length} de {items.length}
            </span>

            <Link to={viewAllLink} className="railToggleBtn">
              Mostrar mais →
            </Link>

            <div className="railArrows">
              <button
                className={`railArrow ${!canLeft ? "disabled" : ""}`}
                onClick={() => scroll(-1)}
                disabled={!canLeft}
                aria-label="Voltar"
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

              <button
                className={`railArrow ${!canRight ? "disabled" : ""}`}
                onClick={() => scroll(1)}
                disabled={!canRight}
                aria-label="Avançar"
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
          </div>
        </div>

        <div className="productRail" ref={railRef}>
          {visibleItems.map((p) => (
            <div className="railItem" key={p.volumeSlug}>
              <ProductCard product={p} onOpen={onOpenProduct} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
