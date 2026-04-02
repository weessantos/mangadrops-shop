import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard.jsx";
import "../styles/product-rail.css";

export default function ProductRail({
  title,
  subtitle,
  meta = "",
  items = [],
  initialVisible = 20,
  onOpenProduct,
}) {
  const railRef = useRef(null);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    return expanded ? items : items.slice(0, initialVisible);
  }, [items, expanded, initialVisible]);

  const hasMore = items.length > initialVisible;

  const updateArrows = () => {
    const el = railRef.current;

    if (!el || expanded) {
      setCanLeft(false);
      setCanRight(false);
      return;
    }

    const maxScroll = el.scrollWidth - el.clientWidth;

    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < maxScroll - 2);
  };

  useEffect(() => {
    updateArrows();

    const el = railRef.current;

    if (!el || expanded) return;

    const onScroll = () => updateArrows();
    const onResize = () => updateArrows();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [visibleItems.length, expanded]);

  const scrollByAmount = (dir) => {
    const el = railRef.current;

    if (!el || expanded) return;

    const amount = Math.round(el.clientWidth * 0.85) * dir;

    el.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  const handleToggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;

      if (railRef.current) {
        railRef.current.scrollTo({
          left: 0,
          behavior: "auto",
        });
      }

      return next;
    });
  };

  if (!items.length) return null;

  return (
    <section className={`railSection ${expanded ? "isExpanded" : ""}`}>
      <div className="railBlock">
        <div className="sectionHeader">
          <div className="sectionHeaderLeft">
            <h2 className="sectionTitle">
              <span className="sectionAccent" aria-hidden="true" />
              {title}
            </h2>

            {subtitle ? (
              <p className="sectionSubtitle">{subtitle}</p>
            ) : null}
          </div>

          <div className="sectionHeaderRight">
            <span className="sectionMeta">
              {meta || `${visibleItems.length} de ${items.length} exibidos`}
            </span>

            {hasMore ? (
              <button
                type="button"
                className="railToggleBtn"
                onClick={handleToggleExpanded}
                aria-expanded={expanded}
              >
                {expanded ? "Recolher" : "Ver todos"}
              </button>
            ) : null}

            {!expanded ? (
              <div className="railArrows" aria-hidden="true">
                <button
                  type="button"
                  className={`railArrow ${canLeft ? "" : "disabled"}`}
                  onClick={() => scrollByAmount(-1)}
                  disabled={!canLeft}
                >
                  ‹
                </button>

                <button
                  type="button"
                  className={`railArrow ${canRight ? "" : "disabled"}`}
                  onClick={() => scrollByAmount(1)}
                  disabled={!canRight}
                >
                  ›
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={`productRail ${expanded ? "productRailExpanded" : ""}`}
          ref={railRef}
          aria-label={title}
        >
          {visibleItems.map((p, index) => (
            <div className="railItem productItem" key={p.volumeSlug}>
              <ProductCard
                product={p}
                onOpen={onOpenProduct}
                priority={index === 0}
                topBadge={p.__badge}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}