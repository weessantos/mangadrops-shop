import { memo, useCallback, useMemo } from "react";
import "../styles/product-card.css";
import { track } from "../utils/analytics.js";
import { getBestPrice, formatPrice, getPrice } from "../utils/priceLoader";
import { getOfferData, getDiscountData } from "../utils/priceUtils";

const base = import.meta.env.BASE_URL;
const ML_ICON = `${base}assets/mercadolivre.svg`;
const AMAZON_ICON = `${base}assets/amazon.svg`;

function ProductCardBase({
  product,
  onOpen,
  showNewBadge = false,
  placement = "grid",
  topBadge = null,
  priority = false,
}) {
  const mlUrl =
    typeof product?.affiliate?.mercadoLivre === "string"
      ? product.affiliate.mercadoLivre.trim()
      : "";

  const amzUrl =
    typeof product?.affiliate?.amazon === "string"
      ? product.affiliate.amazon.trim()
      : "";

  const mlPrice = useMemo(
    () => getPrice(product?.id, "mercadoLivre"),
    [product?.id]
  );

  const amzPrice = useMemo(
    () => getPrice(product?.id, "amazon"),
    [product?.id]
  );

  const offerData = useMemo(
    () =>
      getOfferData({
        mlHref: mlUrl,
        mlPrice,
        amazonHref: amzUrl,
        amazonPrice: amzPrice,
      }),
    [mlUrl, mlPrice, amzUrl, amzPrice]
  );

  const { hasML, hasAmazon, hasBoth, isAvailable } = offerData;

  const bestPrice = useMemo(() => getBestPrice(product?.id), [product?.id]);

  const bestStoreLabel =
    bestPrice?.store === "amazon"
      ? "Amazon"
      : bestPrice?.store === "mercadoLivre"
      ? "Mercado Livre"
      : null;

  const discountData = useMemo(
    () => getDiscountData(product, bestPrice?.value ?? null),
    [product, bestPrice?.value]
  );

  const isNew = useMemo(() => {
    if (!showNewBadge || !product?.addedAt) return false;
    const d = new Date(product.addedAt);
    if (Number.isNaN(d.getTime())) return false;
    const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  }, [showNewBadge, product?.addedAt]);

  const resolvedTopBadge = useMemo(() => {
    if (topBadge?.label) {
      return {
        label: topBadge.label,
        className: topBadge.className || "",
      };
    }

    if (discountData?.hasDiscount && discountData.discountPercent >= 30) {
      return {
        label: `🔥 -${discountData.discountPercent}%`,
        className: "discountBadge",
      };
    }

    if (isNew) {
      return {
        label: "NOVO",
        className: "newBadge",
      };
    }

    return null;
  }, [topBadge, discountData, isNew]);

  const fireOpen = useCallback(
    (via = "card") => {
      track("open_product", {
        product_id: product?.id,
        product_name: product?.title,
        series: product?.series || "",
        volume: product?.volume ?? "",
        available: !!isAvailable,
        placement,
        via,
      });

      onOpen?.(product);
    },
    [product, isAvailable, placement, onOpen]
  );

  const fireBuy = useCallback(
    (store) => {
      track("click_buy", {
        product_id: product?.id,
        product_name: product?.title,
        series: product?.series || "",
        volume: product?.volume ?? "",
        store,
        placement: `${placement}_card`,
        available: !!isAvailable,
      });
    },
    [product, placement, isAvailable]
  );

  const handleCardKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fireOpen("keyboard");
      }
    },
    [fireOpen]
  );

  return (
    <div
      className="card"
      onClick={() => fireOpen("card")}
      role="button"
      tabIndex={0}
      onKeyDown={handleCardKeyDown}
    >
      <div className="thumbWrap">
        <img
          className="thumb"
          src={product.image}
          alt={product.title}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          width="320"
          height="427"
          draggable="false"
        />

        {resolvedTopBadge ? (
          <div className={resolvedTopBadge.className}>
            {resolvedTopBadge.label}
          </div>
        ) : null}
      </div>

      <div className="content">
        <h3 className="title">{product.title}</h3>

        <div className="metaText">
          <span className="metaPublisher">{product.brand}</span>

          {product.volume ? (
            <>
              <span className="metaDot" aria-hidden="true">
                •
              </span>
              <span className="metaVol">Vol. {product.volume}</span>
            </>
          ) : null}

          <span className={`metaStock ${isAvailable ? "good" : "danger"}`}>
            {isAvailable ? "Disponível" : "Em falta"}
          </span>
        </div>

        <div className="cardPriceBox">
          {isAvailable && bestPrice ? (
            <>
              {discountData?.hasDiscount ? (
                <div className="cardPriceOld">
                  De {formatPrice(discountData.listPrice)}
                </div>
              ) : null}

              <div className="cardPriceMainRow">
                <div className="cardPriceValue">
                  {formatPrice(bestPrice.value)}
                </div>

                {discountData?.hasDiscount ? (
                  <span className="cardDiscountBadge">
                    -{discountData.discountPercent}%
                  </span>
                ) : null}
              </div>

              {bestStoreLabel ? (
                <div className="cardPriceStore">{bestStoreLabel}</div>
              ) : null}
            </>
          ) : (
            <div className="cardPriceEmpty" aria-hidden="true" />
          )}
        </div>

        <div className="buttonsCol" onClick={(e) => e.stopPropagation()}>
          {isAvailable ? (
            <div className={hasBoth ? "buyRow" : ""}>
              {hasML ? (
                <a
                  href={mlUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => fireBuy("mercadolivre")}
                  className={hasBoth ? "buyLink grow" : "buyLink single"}
                  aria-label="Comprar no Mercado Livre"
                  title="Comprar no Mercado Livre"
                >
                  <span className="btn brandBtn mercado">
                    <img
                      src={ML_ICON}
                      alt="Mercado Livre"
                      className="brandIcon"
                      loading="lazy"
                      decoding="async"
                      width="92"
                      height="24"
                      draggable="false"
                    />
                  </span>
                </a>
              ) : null}

              {hasAmazon ? (
                <a
                  href={amzUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => fireBuy("amazon")}
                  className={hasBoth ? "buyLink grow" : "buyLink single"}
                  aria-label="Comprar na Amazon"
                  title="Comprar na Amazon"
                >
                  <span className="btn brandBtn amazon">
                    <img
                      src={AMAZON_ICON}
                      alt="Amazon"
                      className="brandIcon"
                      loading="lazy"
                      decoding="async"
                      width="92"
                      height="24"
                      draggable="false"
                    />
                  </span>
                </a>
              ) : null}
            </div>
          ) : (
            <button className="btn danger" type="button" disabled>
              Em falta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(
  ProductCardBase,
  (prev, next) =>
    prev.product === next.product &&
    prev.onOpen === next.onOpen &&
    prev.showNewBadge === next.showNewBadge &&
    prev.placement === next.placement &&
    prev.priority === next.priority &&
    prev.topBadge?.label === next.topBadge?.label &&
    prev.topBadge?.className === next.topBadge?.className
);