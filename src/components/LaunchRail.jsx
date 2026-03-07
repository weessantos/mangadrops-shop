import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard.jsx";
import "../styles/product-rail.css";
import { getPrice } from "../utils/priceLoader";
import { getOfferData } from "../utils/priceUtils";

function isValidDate(v) {
  return typeof v === "string" && !Number.isNaN(new Date(v).getTime());
}

export default function LaunchRail({
  title = "Lançamentos",
  products = [],
  limit = 30,
  subtitle = "Atualizado com lançamentos e reposições recentes.",
  meta = "",
  onOpenProduct,
}) {
  const railRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // últimos 30 dias
  const items = useMemo(() => {
    const now = new Date();
    return [...products]
      .filter((p) => isValidDate(p.addedAt))
      .filter((p) => {
        const d = new Date(p.addedAt);
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      })
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
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
    el.addEventListener("scroll", onScroll, { passive: true });

    // resize muda overflow
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  const scrollByAmount = (dir) => {
    const el = railRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85) * dir; // “quase uma tela”
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="railBlock">
      {/* ✅ Header padrão (igual em todas as sections) */}
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

          {/* Setinhas só aparecem no desktop via CSS */}
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
        {items
          .filter((p) => {
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

            const { isAvailable } = getOfferData({
              mlHref: mlUrl,
              mlPrice,
              amazonHref: amzUrl,
              amazonPrice: amzPrice,
            });

            return isAvailable;
          })
          .map((p) => (
          <div className="railItem productItem" key={p.id}>
            {/* ✅ badge NOVO automática (vamos implementar no ProductCard) */}
            <ProductCard
              product={p}
              onOpen={(prod) => onOpenProduct?.(prod)}
              showNewBadge
            />
          </div>
        ))}
      </div>
    </section>
  );
}
