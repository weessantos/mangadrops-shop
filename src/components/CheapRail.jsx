import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard.jsx";
import "../styles/product-rail.css";
import { getPrice } from "../utils/priceLoader";
import { getOfferData } from "../utils/priceUtils";

export default function CheapRail({
  title = "Mais baratos 💰",
  subtitle = "Os mangás com menor preço do site.",
  products = [],
  limit = 30,
  initialVisible = 20,
  meta = "",
  onOpenProduct,
}) {
  const railRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const items = useMemo(() => {
    return [...products]
      .map((p) => {
        const mlUrl =
          typeof p?.affiliate?.mercadoLivre === "string"
            ? p.affiliate.mercadoLivre.trim()
            : "";

        const amzUrl =
          typeof p?.affiliate?.amazon === "string"
            ? p.affiliate.amazon.trim()
            : "";

        const mlPrice = getPrice(p?.id, "mercadoLivre");
        const amzPrice = getPrice(p?.id, "amazon");

        const offer = getOfferData({
          mlHref: mlUrl,
          mlPrice,
          amazonHref: amzUrl,
          amazonPrice: amzPrice,
        });

        return {
          ...p,
          _offer: offer,
          _bestPriceValue: offer?.bestPrice ?? Infinity,
        };
      })
      .filter((p) => p?._offer?.isAvailable)
      .filter((p) => p._bestPriceValue <= 30)
      .sort((a, b) => a._bestPriceValue - b._bestPriceValue)
      .slice(0, limit);
  }, [products, limit]);

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

            {subtitle ? <p className="sectionSubtitle">{subtitle}</p> : null}
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
                  aria-label="Anterior"
                  title="Anterior"
                >
                  ‹
                </button>

                <button
                  type="button"
                  className={`railArrow ${canRight ? "" : "disabled"}`}
                  onClick={() => scrollByAmount(1)}
                  disabled={!canRight}
                  aria-label="Próximo"
                  title="Próximo"
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
            <div className="railItem productItem" key={p.id}>
              <ProductCard
                product={p}
                onOpen={onOpenProduct}
                priority={index < 4}
                topBadge={{
                  label: "💰 Até R$30",
                  className: "cheapBadge",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}