import { useEffect, useMemo, useRef, useState } from "react";
import "../styles/product-modal.css";

const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

function getTikTokEmbedUrl(tiktokUrl) {
  if (!tiktokUrl) return null;
  const match = tiktokUrl.match(/video\/(\d+)/) || tiktokUrl.match(/\/v\/(\d+)/);
  const videoId = match?.[1];
  if (!videoId) return null;
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

export default function ProductModal({ product, onClose }) {
  const railRef = useRef(null);
  const [desktopTab, setDesktopTab] = useState("details"); // "details" | "video"

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  // (opcional) wheel -> scroll horizontal no rail (quando estiver visível)
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
  const isAvailable = hasML || hasAmazon;
  const hasBoth = hasML && hasAmazon;

  if (!product) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalTop">
          <h1 className="modalHeading">Detalhes do mangá</h1>
          <button className="closeBtn" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="modalContent">
          {/* =======================
              DESKTOP PREMIUM (toggle)
              ======================= */}
          <div className="modalBody desktopOnly">
            {/* LEFT: capa */}
            <div className="modalLeft">
              <div className="modalCover desktopCover">
                <img src={product.image} alt={product.title} />
              </div>

              {/* descrição curtinha opcional embaixo da capa (fica chique) */}
              <p className="modalDesc modalDescLeft desktopCaption">
                {"Clique em comprar. Se você comprar pelo link, pode me ajudar sem pagar nada a mais 🙌"}
              </p>
            </div>

            {/* RIGHT: header + toggle + conteúdo */}
            <div className="modalRight">
              <div className="modalRightTop">
                <h2 className="modalTitle">{product.title}</h2>

                <div className="modalBadges">
                  {product.tag && <span className="badge">{product.tag}</span>}

                  {Number.isFinite(Number(product.volume)) && (
                    <span className="badge">
                      Vol. {String(product.volume).padStart(2, "0")}
                    </span>
                  )}

                  {product.author && (
                    <span className="badge subtle">{product.author}</span>
                  )}

                  {product.genre && (
                    <span className="badge subtle genre">{product.genre}</span>
                  )}
                </div>

                {/* ✅ Toggle premium */}
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

              {/* ✅ Conteúdo do toggle */}
              {desktopTab === "details" ? (
                <div className="tabPanel" role="tabpanel">
                  <div className="detailsCard">
                    <div className="detailsTitle">Sobre este volume</div>
                    <p className="detailsText">
                      {product.description ||
                        "Clique em comprar para ir ao Mercado Livre. Se você comprar pelo link, pode me ajudar sem pagar nada a mais 🙌"}
                    </p>

                    <div className="detailsNote">
                      Dica: troque para <b>Vídeo</b> para ver o review/mostrando o volume.
                    </div>
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
                          />
                        </div>

                        <a
                          href={product.tiktokUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="tiktokExternalBtn"
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
                </div>
              )}

              <div className="modalFooterSpacer" />
            </div>
          </div>

          {/* =======================
              MOBILE (RAIL) - mantém
              ======================= */}
          <div className="modalRail mobileOnly" ref={railRef}>
            {/* PAGE 1 — Produto */}
            <section className="railPage railProduct">
              <div className="productHero">
                <div className="modalCover">
                  <img src={product.image} alt={product.title} />
                </div>

                <div className="productInfoUnder">
                  <h2 className="modalTitle">{product.title}</h2>

                  <div className="modalBadges">
                    {product.tag && <span className="badge">{product.tag}</span>}

                    {Number.isFinite(Number(product.volume)) && (
                      <span className="badge">
                        Vol. {String(product.volume).padStart(2, "0")}
                      </span>
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

            {/* PAGE 2 — TikTok */}
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
                      />
                    </div>

                    <a
                      href={product.tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="tiktokExternalBtn"
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

        {/* FOOTER fixo (mantém o seu) */}
        <div className="modalFooter">
          <div className="buttonsCol" onClick={(e) => e.stopPropagation()}>
            {isAvailable ? (
              <>
                <div className={hasBoth ? "buyRow" : ""}>
                  {hasML && (
                    <a
                      href={mlUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
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
                      onClick={(e) => e.stopPropagation()}
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