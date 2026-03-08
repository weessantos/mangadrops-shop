import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard.jsx";
import "../styles/product-rail.css";
import { getPrice } from "../utils/priceLoader";
import { getOfferData, getDiscountData } from "../utils/priceUtils";

export default function PromoRail({
  title = "Promoções 💸",
  subtitle = "Mangás com 40% OFF ou mais.",
  products = [],
  limit = 30,
  meta = "",
  onOpenProduct,
}) {
  const railRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

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

        const discountData = getDiscountData(p, offer?.bestPrice);

        return {
          ...p,
          _offer: offer,
          _discountData: discountData,
          _discountPercent: discountData?.discountPercent ?? 0,
          _bestPriceValue: offer?.bestPrice ?? Infinity,
        };
      })
      .filter((p) => p?._offer?.isAvailable)
      .filter((p) => p?._discountData?.hasDiscount)
      .filter((p) => p._discountPercent >= 40)
      .sort((a, b) => {
        if (b._discountPercent !== a._discountPercent) {
          return b._discountPercent - a._discountPercent;
        }

        return a._bestPriceValue - b._bestPriceValue;
      })
      .slice(0, limit);
  }, [products, limit]);

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

    const onScroll = () => updateArrows();
    const onResize = () => updateArrows();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  const scrollByAmount = (dir) => {
    const el = railRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="railSection">
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
            {meta ? <span className="sectionMeta">{meta}</span> : null}

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
          </div>
        </div>

        <div className="productRail" ref={railRef} aria-label={title}>
          {items.map((p) => (
            <div className="railItem productItem" key={p.id}>
              <ProductCard
                product={p}
                onOpen={(prod) => onOpenProduct?.(prod)}
                topBadge={{
                  label: `🔥 -${p._discountPercent}%`,
                  className: "discountBadge",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}