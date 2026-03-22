import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/product-modal.css";
import { track } from "../utils/analytics.js";
import {
  getPrice,
  formatPrice,
  getBestPrice,
} from "../utils/priceLoader";

const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

const handleOverlayWheel = (e) => {
  const scrollContainer = e.target.closest(".modalContent");

  if (!scrollContainer) {
    e.preventDefault();
    return;
  }

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
  const goingDown = e.deltaY > 0;
  const goingUp = e.deltaY < 0;

  const atTop = scrollTop <= 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

  if ((goingUp && atTop) || (goingDown && atBottom)) {
    e.preventDefault();
  }
};

function getTikTokEmbedUrl(tiktokUrl) {
  if (!tiktokUrl) return null;
  const match = tiktokUrl.match(/video\/(\d+)/) || tiktokUrl.match(/\/v\/(\d+)/);
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
  isBest,
  showPrice,
  onClick,
}) {
  const storeClass = store === "Mercado Livre" ? "mercado" : "amazon";
  const hasVisiblePrice = showPrice && price != null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className={`storeBuyCard ${storeClass}`}
      aria-label={
        hasVisiblePrice ? `Comprar na ${store}` : `Consultar valor na ${store}`
      }
      title={
        hasVisiblePrice ? `Comprar na ${store}` : `Consultar valor na ${store}`
      }
    >
      <div className="storeBuyTop">
        <img src={logo} alt={alt} className="brandIcon" />
        {hasVisiblePrice && isBest ? (
          <span className="storeBestBadge">melhor oferta</span>
        ) : null}
      </div>

      <div className="storeBuyPrice">
        {hasVisiblePrice ? formatPrice(price) : "Consultar valor"}
      </div>

      <div className="storeBuyMeta">
        {hasVisiblePrice ? "Ver oferta na loja" : "Toque para consultar"}
      </div>
    </a>
  );
}

export default function ProductModal({ product, onClose }) {
  const railRef = useRef(null);
  const [desktopTab, setDesktopTab] = useState("details");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.shiftKey) return;
      if (el.clientWidth === 0 || el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const tiktokEmbedUrl = useMemo(
    () => getTikTokEmbedUrl(product?.tiktokUrl),
    [product?.tiktokUrl]
  );

  const mlUrl =
    product?.affiliate?.mercadoLivre &&
    typeof product.affiliate.mercadoLivre === "string" &&
    product.affiliate.mercadoLivre.trim() !== ""
      ? product.affiliate.mercadoLivre
      : typeof product?.affiliateUrl === "string"
      ? product.affiliateUrl.trim()
      : "";

  const amzUrl =
    product?.affiliate?.amazon &&
    typeof product.affiliate.amazon === "string" &&
    product.affiliate.amazon.trim() !== ""
      ? product.affiliate.amazon
      : "";

  const hasML = !!mlUrl;
  const hasAmazon = !!amzUrl;
  const hasAffiliateLink = hasML || hasAmazon;
  const hasBoth = hasML && hasAmazon;

  if (!product) return null;

  const mlPrice = getPrice(product, "mercadoLivre");
  const amazonPrice = getPrice(product, "amazon");
  const bestPrice = getBestPrice(product);

  const coverPrice = useMemo(() => {
    const raw = product?.coverPrice;
    if (raw == null || raw === "") return null;

    const parsed =
      typeof raw === "number"
        ? raw
        : Number(String(raw).replace(",", ".").trim());

    return Number.isFinite(parsed) ? parsed : null;
  }, [product?.coverPrice]);

  const maxVisiblePrice = useMemo(() => {
    if (!Number.isFinite(coverPrice)) return null;
    return coverPrice * 1.15;
  }, [coverPrice]);

  const shouldHideMlPrice = useMemo(() => {
    if (!Number.isFinite(mlPrice)) return true;
    if (!Number.isFinite(maxVisiblePrice)) return false;
    return mlPrice > maxVisiblePrice;
  }, [mlPrice, maxVisiblePrice]);

  const shouldHideAmazonPrice = useMemo(() => {
    if (!Number.isFinite(amazonPrice)) return true;
    if (!Number.isFinite(maxVisiblePrice)) return false;
    return amazonPrice > maxVisiblePrice;
  }, [amazonPrice, maxVisiblePrice]);

  const visibleMlPrice = !shouldHideMlPrice ? mlPrice : null;
  const visibleAmazonPrice = !shouldHideAmazonPrice ? amazonPrice : null;

  const hasVisibleMlPrice = visibleMlPrice != null;
  const hasVisibleAmazonPrice = visibleAmazonPrice != null;

  const visibleBestStore =
    hasVisibleMlPrice && hasVisibleAmazonPrice
      ? visibleMlPrice <= visibleAmazonPrice
        ? "mercadoLivre"
        : "amazon"
      : hasVisibleMlPrice
      ? "mercadoLivre"
      : hasVisibleAmazonPrice
      ? "amazon"
      : null;

  const isMlBest = visibleBestStore === "mercadoLivre";
  const isAmazonBest = visibleBestStore === "amazon";

  const fireBuy = (store, placement) => {
    track("click_buy", {
      product_id: product?.id,
      product_name: product?.title,
      series: product?.series || "",
      volume: product?.volume ?? "",
      store,
      placement,
      available: !!hasAffiliateLink,
      has_both: !!hasBoth,
    });
  };

  const renderBuyButtons = (placement = "modal_inline") => {
    if (!hasAffiliateLink) {
      return (
        <div className="buyBlock">
          <button className="btn danger" type="button" disabled>
            Em falta
          </button>
        </div>
      );
    }

    return (
      <div className="buyBlock">
        <div className={`buyRow buyRowCards ${hasBoth ? "twoCols" : "oneCol"}`}>
          {hasML && (
            <StoreButton
              href={mlUrl}
              store="Mercado Livre"
              logo={img("mercadolivre.svg")}
              alt="Mercado Livre"
              price={visibleMlPrice}
              showPrice={hasVisibleMlPrice}
              isBest={isMlBest}
              onClick={(e) => {
                e.stopPropagation();
                fireBuy("mercadolivre", placement);
              }}
            />
          )}

          {hasAmazon && (
            <StoreButton
              href={amzUrl}
              store="Amazon"
              logo={img("amazon.svg")}
              alt="Amazon"
              price={visibleAmazonPrice}
              showPrice={hasVisibleAmazonPrice}
              isBest={isAmazonBest}
              onClick={(e) => {
                e.stopPropagation();
                fireBuy("amazon", placement);
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="modalOverlay" onClick={onClose} onWheel={handleOverlayWheel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalTop">
          <h1 className="modalHeading">Detalhes do mangá</h1>
          <button className="closeBtn" onClick={onClose} aria-label="Fechar" type="button">
            ✕
          </button>
        </div>

        <div className="modalContent">
          <div className="modalBody desktopOnly">
            <div className="modalLeft">
              <div className="modalCover desktopCover">
                <img src={product.image} alt={product.title} loading="eager" decoding="async" />
              </div>

              <p className="modalDesc modalDescLeft desktopCaption">
                Clique em comprar. Se você comprar pelo link, pode me ajudar sem
                pagar nada a mais 🙌
              </p>
            </div>

            <div className="modalRight">
              <div className="modalRightTop">
                <h2 className="modalTitle">{product.title}</h2>

                <div className="modalBadges">
                  {product.brand && <span className="badge">{product.brand}</span>}

                  {Number.isFinite(Number(product.volume)) && (
                    <span className="badge">
                      Vol. {String(product.volume).padStart(2, "0")}
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

                <div
                  className="tabPills"
                  role="tablist"
                  aria-label="Alternar conteúdo do modal"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={desktopTab === "details"}
                    className={`tabPill ${desktopTab === "details" ? "active" : ""}`}
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
                <div className="tabPanel" role="tabpanel">
                  <div className="detailsCard">
                    <div className="detailsTitle">Sobre este volume</div>
                    <p className="detailsText">
                      {product.description ||
                        "Clique em comprar para ir ao Mercado Livre. Se você comprar pelo link, pode me ajudar sem pagar nada a mais 🙌"}
                    </p>

                    <div className="detailsNote">
                      Dica: troque para <b>Vídeo</b> para ver o review/mostrando
                      o volume.
                    </div>
                  </div>

                  <div className="desktopBuySection">
                    {renderBuyButtons("modal_desktop_details")}
                  </div>
                </div>
              ) : (
                <div className="tabPanel" role="tabpanel">
                  <div className={`mediaCard ${tiktokEmbedUrl ? "hasVideo" : "noVideo"}`}>
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
                      <div className="tiktokPlaceholder tiktokDesktop">
                        <div className="tiktokPlaceholderIcon">🎥</div>
                        <div className="tiktokPlaceholderText">
                          Vídeo em breve neste volume.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="desktopBuySection desktopBuySectionVideo">
                    {renderBuyButtons("modal_desktop_video")}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modalRail mobileOnly" ref={railRef}>
            <section className="railPage railProduct">
              <div className="productHero">
                <div className="modalCover">
                  <img src={product.image} alt={product.title} loading="eager" decoding="async" />
                </div>

                <div className="productInfoUnder">
                  <h2 className="modalTitle">{product.title}</h2>

                  <div className="modalBadges">
                    {product.brand && <span className="badge">{product.brand}</span>}

                    {Number.isFinite(Number(product.volume)) && (
                      <span className="badge">
                        Vol. {String(product.volume).padStart(2, "0")}
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

                <div className="mobileVideoBuyBlock">
                  {renderBuyButtons("modal_mobile_video")}
                </div>
              </div>

              <div className="modalHint">⟵ Voltar para o produto</div>
              <div className="modalFooterSpacer" />
            </section>
          </div>
        </div>

        <div className="modalFooter mobileOnly">
          <div className="buttonsCol" onClick={(e) => e.stopPropagation()}>
            {hasAffiliateLink ? (
              <>
                {renderBuyButtons("modal_mobile_footer")}

                <button className="btn ghost" onClick={onClose} type="button">
                  Voltar
                </button>
              </>
            ) : (
              <>
                <button className="btn danger" type="button" disabled>
                  Em falta
                </button>
                <button className="btn ghost" onClick={onClose} type="button">
                  Voltar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}