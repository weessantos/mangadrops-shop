import "../styles/product-card.css";
import { track } from "../utils/analytics.js";
import { getBestPrice, formatPrice, getPrice } from "../utils/priceLoader";
import { getOfferData, getDiscountData } from "../utils/priceUtils";

const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

export default function ProductCard(props) {
  const {
    product,
    onOpen,
    showNewBadge = false,
    placement = "grid",
    topBadge = null,
  } = props;

  const mlUrl =
    typeof product?.affiliate?.mercadoLivre === "string"
      ? product.affiliate.mercadoLivre.trim()
      : "";

  const amzUrl =
    typeof product?.affiliate?.amazon === "string"
      ? product.affiliate.amazon.trim()
      : "";

  const mlPrice = getPrice(product?.id, "mercadoLivre");
  const amzPrice = getPrice(product?.id, "amazon");

  const { hasML, hasAmazon, hasBoth, isAvailable } = getOfferData({
    mlHref: mlUrl,
    mlPrice,
    amazonHref: amzUrl,
    amazonPrice: amzPrice,
  });

  const bestPrice = getBestPrice(product?.id);

  const bestStoreLabel =
    bestPrice?.store === "amazon"
      ? "Amazon"
      : bestPrice?.store === "mercadoLivre"
      ? "Mercado Livre"
      : null;

  const discountData = getDiscountData(product, bestPrice?.value ?? null);

  const isNew = (() => {
    if (!showNewBadge) return false;
    if (!product?.addedAt) return false;

    const d = new Date(product.addedAt);
    if (Number.isNaN(d.getTime())) return false;

    const diffDays = (new Date() - d) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  })();

  const resolvedTopBadge = (() => {
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
  })();

  const fireOpen = (via = "card") => {
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
  };

  const fireBuy = (store) => {
    track("click_buy", {
      product_id: product?.id,
      product_name: product?.title,
      series: product?.series || "",
      volume: product?.volume ?? "",
      store,
      placement: `${placement}_card`,
      available: !!isAvailable,
    });
  };

  return (
    <div
      className="card cardHover"
      onClick={() => fireOpen("card")}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && fireOpen("keyboard")}
    >
      <div className="thumbWrap">
        <img className="thumb" src={product.image} alt={product.title} />

        {resolvedTopBadge ? (
          <div className={resolvedTopBadge.className}>
            {resolvedTopBadge.label}
          </div>
        ) : null}

        <div className="hoverOverlay" aria-hidden="true">
          <button
            className="overlayBtn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fireOpen("overlay");
            }}
          >
            Ver detalhes
          </button>
        </div>
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
              {discountData?.hasDiscount && (
                <div className="cardPriceOld">
                  De {formatPrice(discountData.listPrice)}
                </div>
              )}

              <div className="cardPriceMainRow">
                <div className="cardPriceValue">
                  {formatPrice(bestPrice.value)}
                </div>

                {discountData?.hasDiscount && (
                  <span className="cardDiscountBadge">
                    -{discountData.discountPercent}%
                  </span>
                )}
              </div>

              {bestStoreLabel && <div className="cardPriceStore">{bestStoreLabel}</div>}
            </>
          ) : (
            <div className="cardPriceEmpty" aria-hidden="true" />
          )}
        </div>

        <div className="buttonsCol" onClick={(e) => e.stopPropagation()}>
          {isAvailable ? (
            <div className={hasBoth ? "buyRow" : ""}>
              {hasML && (
                <a
                  href={mlUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    fireBuy("mercadolivre");
                  }}
                  className={hasBoth ? "buyLink grow" : "buyLink single"}
                  aria-label="Comprar no Mercado Livre"
                  title="Comprar no Mercado Livre"
                >
                  <button className="btn brandBtn mercado" type="button">
                    <img
                      src={img("mercadolivre.svg")}
                      alt="Mercado Livre"
                      className="brandIcon"
                    />
                  </button>
                </a>
              )}

              {hasAmazon && (
                <a
                  href={amzUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    fireBuy("amazon");
                  }}
                  className={hasBoth ? "buyLink grow" : "buyLink single"}
                  aria-label="Comprar na Amazon"
                  title="Comprar na Amazon"
                >
                  <button className="btn brandBtn amazon" type="button">
                    <img
                      src={img("amazon.svg")}
                      alt="Amazon"
                      className="brandIcon"
                    />
                  </button>
                </a>
              )}
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