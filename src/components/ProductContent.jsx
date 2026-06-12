/*
|--------------------------------------------------------------------------
| ProductContent
|--------------------------------------------------------------------------
|
| Responsável pela interface visual do produto.
|
| Aqui fica TODO o conteúdo reutilizável:
| - imagem
| - título
| - preços
| - botões de compra
| - descrição
| - TikTok embed
| - tabs
| - badges
| - layout interno
|
| Esse componente NÃO sabe:
| - se está em modal
| - se está em página
| - sobre rotas
| - sobre navegação
|
| Ele apenas recebe:
| -> product
|
| Isso permite reutilizar a mesma UI em:
| - ProductModal
| - futuras páginas
| - previews
| - cards expandidos
|
|--------------------------------------------------------------------------
*/

import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/product-modal.css";
import "../styles/product-modal-mobile.css";

import { track } from "../utils/analytics.js";
import { formatPrice } from "../utils/priceLoader";
import { getDiscountState, toNumber } from "../utils/pricing";
import { hasReview, getReviewUrl } from "../utils/review";
import { img } from "../utils/images";

const ML_ICON = img({
  prefix: "mercadolivre.svg",
});

const AMAZON_ICON = img({
  prefix: "amazon.svg",
});

function getTikTokEmbedUrl(tiktokUrl) {
  if (!tiktokUrl) return null;

  const match =
    tiktokUrl.match(/video\/(\d+)/) || tiktokUrl.match(/\/v\/(\d+)/);

  const videoId = match?.[1];

  if (!videoId) return null;

  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

function StoreButton({
  href,
  store,
  logo,
  alt,
  price,
  discount,
  isBest,
  showPrice,
  onClick,
}) {
  const storeClass = store === "Mercado Livre" ? "mercado" : "amazon";

  const discountState = getDiscountState(discount);

  const shouldShowConsultOnly = discountState === "CONSULT";

  const isOutOfStock = discountState === "ABUSIVE";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className={`storeBuyCard ${storeClass}`}
    >
      <div className="storeBuyTop">
        <img src={logo} alt={alt} className="brandIcon" />

        {!shouldShowConsultOnly && !isOutOfStock && isBest ? (
          <span className="storeBestBadge">melhor oferta</span>
        ) : null}
      </div>

      <div className="storeBuyPrice">
        {shouldShowConsultOnly || isOutOfStock
          ? "Consultar valor"
          : formatPrice(price)}
      </div>

      <div className="storeBuyMeta">
        {shouldShowConsultOnly || isOutOfStock
          ? "Toque para consultar"
          : "Ver oferta na loja"}
      </div>
    </a>
  );
}

export default function ProductContent({ product, onClose, dragOffset }) {
  const railRef = useRef(null);

  const titleRef = useRef(null);

  const wrapRef = useRef(null);

  const [isOverflowing, setIsOverflowing] = useState(false);

  const [desktopTab, setDesktopTab] = useState("details");

  useEffect(() => {
    const el = railRef.current;

    if (!el) return;

    const onWheel = (e) => {
      if (e.shiftKey) return;

      if (el.clientWidth === 0 || el.scrollWidth <= el.clientWidth) {
        return;
      }

      e.preventDefault();

      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, {
      passive: false,
    });

    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      if (!titleRef.current || !wrapRef.current) return;

      const titleWidth = titleRef.current.scrollWidth;

      const wrapWidth = wrapRef.current.clientWidth;

      setIsOverflowing(titleWidth > wrapWidth);
    };

    checkOverflow();

    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [product?.title]);

  const tiktokEmbedUrl = useMemo(
    () => getTikTokEmbedUrl(product?.tiktokUrl),
    [product?.tiktokUrl],
  );

  const reviewUrl = getReviewUrl(product);

  const contentTypeLabel = {
    manga: "Mangá",
    novel: "Novel",
    spin_off: "Spin-off",
    databook: "Databook",
    artbook: "Artbook",
  };

  const mlUrl =
    typeof product?.affiliate?.mercadoLivre === "string"
      ? product.affiliate.mercadoLivre.trim()
      : "";

  const amzUrl =
    typeof product?.affiliate?.amazon === "string"
      ? product.affiliate.amazon.trim()
      : "";

  const mlPrice =
    product?.mercado_livre_price != null
      ? Number(product.mercado_livre_price)
      : null;

  const amazonPrice =
    product?.amazon_price != null ? Number(product.amazon_price) : null;

  const bestPrice =
    product?.best_price != null ? Number(product.best_price) : null;

  const hasMlPrice = Number.isFinite(mlPrice);

  const hasAmazonPrice = Number.isFinite(amazonPrice);

  const hasML = hasMlPrice;
  const hasAmazon = hasAmazonPrice;

  const hasBoth = hasML && hasAmazon;

  const isMlBest = bestPrice === mlPrice;

  const isAmazonBest = bestPrice === amazonPrice;

  const renderBuyButtons = (placement = "product") => {
    const hasStores = hasML || hasAmazon;

    return (
      <div className="buyBlock">
        <div className={`buyRow buyRowCards ${hasBoth ? "twoCols" : "oneCol"}`}>
          {hasML && (
            <StoreButton
              href={mlUrl}
              store="Mercado Livre"
              logo={ML_ICON}
              alt="Mercado Livre"
              price={mlPrice}
              discount={product.discount}
              showPrice
              isBest={isMlBest}
              onClick={() =>
                track("click_buy", {
                  product_id: product?.id,
                  placement,
                  store: "mercadolivre",
                })
              }
            />
          )}

          {hasAmazon && (
            <StoreButton
              href={amzUrl}
              store="Amazon"
              logo={AMAZON_ICON}
              alt="Amazon"
              price={amazonPrice}
              discount={product.discount}
              showPrice
              isBest={isAmazonBest}
              onClick={() =>
                track("click_buy", {
                  product_id: product?.id,
                  placement,
                  store: "amazon",
                })
              }
            />
          )}

          {!hasStores && (
            <div className="storeUnavailableCard">
              <div className="storeUnavailableTop">📦 Volume indisponível</div>

              <p>Este volume está sem ofertas disponíveis no momento.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!product) return null;

  return (
    <div
      className="modalContent"
      style={{
        "--cover-image": `url(${product?.image || ""})`,
      }}
    >
      <div className="modalBody tablet-scale-strong">
        <div className="modalLeft">
          <div className="modalCover desktopCover">
            <img
              src={product.image}
              alt={product.title}
              loading="eager"
              decoding="async"
              style={{
                transform: `
                  perspective(1400px)
                  rotateY(${dragOffset * 0.22}deg)
                  translateX(${dragOffset * 0.12}px)
                `,
              }}
            />
          </div>
        </div>

        <div className="modalRight">
          <div className="mobileInfoTop">
            <div className="modalRightTop">
              <div
                ref={wrapRef}
                className={`modalTitleWrap ${
                  isOverflowing ? "is-marquee" : ""
                }`}
              >
                <h2 ref={titleRef} className="modalTitle">
                  {product.title}
                </h2>
              </div>

              {product.author && (
                <p className="modalAuthor">Por {product.author}</p>
              )}

              <div className="modalBadges">
                {product.brand && (
                  <span className="badge">{product.brand}</span>
                )}

                {product.format && (
                  <span className="badge subtle">{product.format}</span>
                )}

                {product.content_type && (
                  <span className="badge subtle">
                    {contentTypeLabel[product.content_type] ||
                      product.content_type}
                  </span>
                )}

                {product.genre && (
                  <span className="badge genre">{product.genre}</span>
                )}
              </div>
            </div>
            <div
              className="tabPills"
              role="tablist"
              aria-label="Alternar conteúdo do modal"
            >
              <button
                type="button"
                role="tab"
                aria-selected={desktopTab === "details"}
                className={`tabPill ${
                  desktopTab === "details" ? "active" : ""
                }`}
                onClick={() => setDesktopTab("details")}
              >
                Detalhes
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={desktopTab === "video"}
                className={`tabPill ${desktopTab === "video" ? "active" : ""}`}
                onClick={() => setDesktopTab("video")}
              >
                Vídeo
              </button>
            </div>
          </div>

          {desktopTab === "details" ? (
            <>
              <div className="tabPanel" role="tabpanel">
                <div className="detailsCard">
                  <div className="detailsTitle">Sobre este volume</div>

                  <p className="detailsText">
                    {product.description ||
                      "Clique em comprar para ir ao Mercado Livre. Se você comprar pelo link, pode me ajudar sem pagar nada a mais 🙌"}
                  </p>
                </div>
              </div>

              <div className="desktopBuySection">
                {renderBuyButtons("modal_desktop_details")}
              </div>
            </>
          ) : (
            <>
              <div className="tabPanel" role="tabpanel">
                <div
                  className={`mediaCard ${
                    tiktokEmbedUrl ? "hasVideo" : "noVideo"
                  }`}
                >
                  {tiktokEmbedUrl ? (
                    <>
                      <div className="tiktokEmbedWrap tiktokDesktop">
                        <iframe
                          src={tiktokEmbedUrl}
                          title={`TikTok ${product.id}`}
                          className="tiktokIframe"
                          allow="encrypted-media;"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>

                      <a
                        href={product.tiktokUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="tiktokExternalBtn"
                        onClick={() =>
                          track("click_tiktok", {
                            product_id: product?.id,
                            product_name: product?.title,
                            placement: "modal_desktop",
                          })
                        }
                      >
                        Ver no TikTok
                      </a>
                    </>
                  ) : (
                    <div className="videoHeroCard">
                      <div className="videoHeroRow">
                        <div className="videoHeroPlay">▶</div>

                        <div className="videoHeroMeta">
                          <span>Conteúdo em vídeo</span>

                          <h3>Review deste volume</h3>

                          <p>
                            Veja detalhes da edição e comentários rápidos no
                            TikTok.
                          </p>
                        </div>
                      </div>
                      {hasReview(product) && reviewUrl ? (
                        <a
                          href={reviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="videoHeroButton"
                          onClick={() =>
                            track("click_video", {
                              product_id: product?.id,
                              product_name: product?.title,
                              placement: "modal_desktop",
                            })
                          }
                        >
                          Abrir no TikTok
                        </a>
                      ) : (
                        <div className="videoHeroButton disabled">
                          Vídeo em breve
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="desktopBuySection desktopBuySectionVideo">
                {renderBuyButtons("modal_desktop_video")}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="modalAffiliateNote">
        <span className="affiliateDot" />

        <p>
          Comprando pelos links você apoia o projeto sem pagar nada a mais 🙌
        </p>
      </div>

      <div className="modalRail mobileOnly" ref={railRef}>
        <section className="railPage railProduct">
          <div className="productHero">
            <div className="modalCover">
              <img
                src={product.image}
                alt={product.title}
                loading="eager"
                decoding="async"
              />
            </div>

            <div className="productInfoUnder">
              <div className="modalTitleWrap">
                <h2 className="modalTitle">{product.title}</h2>
              </div>

              <div className="modalBadges">
                {product.brand && (
                  <span className="badge">{product.brand}</span>
                )}

                {product.content_type && (
                  <span className="badge subtle">
                    {contentTypeLabel[product.content_type] ||
                      product.content_type}
                  </span>
                )}

                {product.format && (
                  <span className="badge subtle">{product.format}</span>
                )}

                {product.author && (
                  <span className="badge subtle">{product.author}</span>
                )}

                {product.genre && (
                  <span className="badge subtle genre">{product.genre}</span>
                )}
              </div>
            </div>
          </div>

          <p className="modalDesc modalDescLeft">
            {product.description ||
              "Clique em comprar para ir ao Mercado Livre. Se você comprar pelo link, pode me ajudar sem pagar nada a mais 🙌"}
          </p>

          <div className="modalHint">Deslize para o vídeo ➜</div>
          <div className="modalFooterSpacer" />
        </section>

        <section className="railPage railTikTok">
          <div className="tiktokBlock">
            {tiktokEmbedUrl ? (
              <>
                <div className="tiktokEmbedWrap tiktokTall">
                  <iframe
                    src={tiktokEmbedUrl}
                    title={`TikTok ${product.id}`}
                    className="tiktokIframe"
                    allow="encrypted-media;"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                <a
                  href={product.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="tiktokExternalBtn"
                  onClick={() =>
                    track("click_tiktok", {
                      product_id: product?.id,
                      product_name: product?.title,
                      placement: "modal_mobile",
                    })
                  }
                >
                  Ver no TikTok
                </a>
              </>
            ) : (
              <div className="tiktokPlaceholder tiktokCompact">
                <div className="tiktokPlaceholderIcon">🎥</div>
                <div className="tiktokPlaceholderText">
                  Vídeo em breve neste volume.
                </div>
              </div>
            )}
          </div>

          <div className="modalHint">⟵ Voltar para o produto</div>
          <div className="modalFooterSpacer" />
        </section>
      </div>
    </div>
  );
}
