import "../styles/product-card.css";
import { track } from "../utils/analytics";

const base = import.meta.env.BASE_URL;
const img = (path) => `${base}assets/${path}`;

export default function ProductCard(props) {
  const { product, onOpen, showNewBadge = false, placement = "grid" } = props;

  const mlUrl =
    product?.affiliate?.mercadoLivre &&
    typeof product.affiliate.mercadoLivre === "string" &&
    product.affiliate.mercadoLivre.trim() !== ""
      ? product.affiliate.mercadoLivre
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

  const isNew = (() => {
    if (!showNewBadge) return false;
    if (!product?.addedAt) return false;
    const d = new Date(product.addedAt);
    if (Number.isNaN(d.getTime())) return false;
    const diffDays = (new Date() - d) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  })();

  const fireOpen = (via = "card") => {
    track("open_product", {
      product_id: product?.id,
      product_name: product?.title,
      series: product?.series || "",
      volume: product?.volume ?? "",
      available: !!isAvailable,
      placement,
      via, // "card" | "overlay" | "keyboard"
    });

    onOpen?.(product);
  };

  const fireBuy = (store, url) => {
    track("click_buy", {
      product_id: product?.id,
      product_name: product?.title,
      series: product?.series || "",
      volume: product?.volume ?? "",
      store, // "mercadolivre" | "amazon"
      placement: `${placement}_card`,
      available: !!isAvailable,
    });

    // link abre pelo <a>, aqui é só tracking
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
        {isNew ? <div className="newBadge">NOVO</div> : null}

        {/* Overlay aparece no hover e o botão abre o modal */}
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
        {/* Obra */}
        <h3 className="title">{product.title}</h3>

        {/* Editora • Vol */}
        <div className="metaText">
          <span className="metaPublisher">{product.tag}</span>

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

        {/* Botões de compra (SVG only) */}
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
                    fireBuy("mercadolivre", mlUrl);
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
                    fireBuy("amazon", amzUrl);
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