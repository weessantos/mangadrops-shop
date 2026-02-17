import { useEffect, useMemo } from "react";

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

  const tiktokEmbedUrl = useMemo(
    () => getTikTokEmbedUrl(product?.tiktokUrl),
    [product?.tiktokUrl]
  );

  // ✅ MESMO PADRÃO DO ProductCard (com fallback opcional pro affiliateUrl antigo)
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

  // (opcional) segurança pra evitar crash se abrir modal sem product
  if (!product) return null;

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modalTop">
          <div className="pill">Detalhes do mangá</div>
          <button className="closeBtn" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="modalContent">
          <div className="modalBody">
            <div className="modalLeft">
              <div className="modalCover">
                <img src={product.image} alt={product.title} />
              </div>

              <p className="modalDesc modalDescLeft">
                {product.description ||
                  "Clique em comprar para ir ao Mercado Livre. Se você comprar pelo link, pode me ajudar sem pagar nada a mais 🙌"}
              </p>
            </div>

            <div className="modalRight">
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

              <div className="tiktokBlock">
                {tiktokEmbedUrl ? (
                  <>
                    <div className="tiktokEmbedWrap">
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
                  <div className="tiktokPlaceholder">
                    <div className="tiktokPlaceholderIcon">🎥</div>
                    <div className="tiktokPlaceholderText">
                      Vídeo em breve neste volume.
                    </div>
                  </div>
                )}
              </div>

              <div className="modalFooterSpacer" />
            </div>
          </div>
        </div>

        {/* 🔥 FIXO NO RODAPÉ (igual ao card) */}
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
