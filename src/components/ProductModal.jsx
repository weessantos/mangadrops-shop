/*
|--------------------------------------------------------------------------
| ProductModal
|--------------------------------------------------------------------------
|
| Responsável SOMENTE pelo comportamento de modal.
|
| Aqui ficam:
| - overlay/backdrop
| - fechamento do modal
| - ESC key
| - controle de navegação
| - leitura da URL
| - busca do produto via rota
| - comportamento visual de modal
|
| NÃO colocar aqui:
| - UI detalhada do produto
| - preços
| - descrição
| - tabs
| - lógica de conteúdo
|
| Toda a interface visual do produto vive em:
| -> ProductContent.jsx
|
|--------------------------------------------------------------------------
*/

import { useEffect, useState, useRef } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import ProductContent from "./ProductContent";

import { getSelectedProduct } from "../utils/getSelectedProduct.js";

import { supabaseClient } from "../lib/supabase.js";
import { normalizeProduct } from "../utils/normalizeProduct";

import "../styles/product-modal.css";
import "../styles/product-modal-mobile.css";

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

export default function ProductModal() {
  const navigate = useNavigate();
  const location = useLocation();

  const { volumeId } = useParams();

  const stateProducts = location.state?.products || [];

  const [product, setProduct] = useState(() =>
    getSelectedProduct(stateProducts, volumeId),
  );

  const [seriesProducts, setSeriesProducts] = useState([]);

  const [isSwitching, setIsSwitching] = useState(false);

  const [switchDirection, setSwitchDirection] = useState("next");

  const touchStartX = useRef(0);

  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    // ✅ já veio da navegação interna
    if (product) return;

    let mounted = true;

    async function loadProduct() {
      const { data, error } = await supabaseClient
        .from("series_volumes_view")
        .select("*");

      if (error) {
        console.error(error);
        return;
      }

      if (!mounted) return;

      const normalized = (data || []).map(normalizeProduct);

      const found = getSelectedProduct(normalized, volumeId);

      if (!found) {
        setProduct(null);
        return;
      }

      const sameSeries = normalized
        .filter((p) => p.seriesSlug === found.seriesSlug)
        .sort((a, b) => Number(a.volume || 0) - Number(b.volume || 0));

      setSeriesProducts(sameSeries);

      setProduct(found);
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [volumeId, product]);

  useEffect(() => {
    if (!product || !stateProducts.length) return;

    const sameSeries = stateProducts
      .filter((p) => p.seriesSlug === product.seriesSlug)
      .sort((a, b) => Number(a.volume || 0) - Number(b.volume || 0));

    setSeriesProducts(sameSeries);
  }, [product, stateProducts]);

  const onClose = () => {
    const backgroundLocation = location.state?.backgroundLocation;

    if (backgroundLocation) {
      navigate(backgroundLocation, {
        replace: true,
      });

      return;
    }

    navigate("/", {
      replace: true,
    });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* =====================================================
   NAVEGAÇÃO ENTRE VOLUMES
===================================================== */

  const currentIndex = seriesProducts.findIndex((p) => p.id === product.id);

  const hasPrev = currentIndex > 0;

  const hasNext = currentIndex < seriesProducts.length - 1;

  const switchVolume = (nextProduct, direction = "next") => {
    if (!nextProduct) return;

    setSwitchDirection(direction);

    setIsSwitching(true);

    setTimeout(() => {
      navigate(`/${nextProduct.seriesSlug}/${nextProduct.volumeSlug}`, {
        replace: true,
        state: location.state,
      });

      setProduct(nextProduct);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSwitching(false);
        });
      });
    }, 170);
  };

  const goPrevVolume = () => {
    if (!hasPrev) return;

    const prev = seriesProducts[currentIndex - 1];

    switchVolume(prev, "prev");
  };

  const goNextVolume = () => {
    if (!hasNext) return;

    const next = seriesProducts[currentIndex + 1];

    switchVolume(next, "next");
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e) => {
    if (window.innerWidth > 768) return;

    const currentX = e.changedTouches[0].screenX;

    const diff = currentX - touchStartX.current;

    // limita o movimento
    const limited = Math.max(-80, Math.min(80, diff));

    setDragOffset(limited);
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].screenX;

    const diff = endX - touchStartX.current;

    setDragOffset(0);

    // swipe direita
    if (diff > 70 && hasPrev) {
      goPrevVolume();
    }

    // swipe esquerda
    if (diff < -70 && hasNext) {
      goNextVolume();
    }
  };

  if (!product) return null;

  return (
    <div
      className="modalOverlay"
      onClick={onClose}
      onWheel={handleOverlayWheel}
    >
      <div
        className={`modal ${isSwitching ? `switching ${switchDirection}` : ""}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* =====================================================
          NAVEGAÇÃO ENTRE VOLUMES
         ===================================================== */}

        <button
          className="volumeNav volumePrev"
          type="button"
          aria-label="Volume anterior"
          onClick={goPrevVolume}
          disabled={!hasPrev}
        >
          <span>‹</span>
        </button>

        <button
          className="volumeNav volumeNext"
          type="button"
          aria-label="Próximo volume"
          onClick={goNextVolume}
          disabled={!hasNext}
        >
          <span>›</span>
        </button>

        {/* =====================================================
          TOPO MODAL
         ===================================================== */}

        <div className="modalTop">
          <h1 className="modalHeading">Detalhes do mangá</h1>

          <button
            className="closeBtn"
            onClick={onClose}
            aria-label="Fechar"
            type="button"
          >
            ✕
          </button>
        </div>

        <ProductContent
          product={product}
          onClose={onClose}
          dragOffset={dragOffset}
        />

        {/* =====================================================
          OBRAS RELACIONADAS
         ===================================================== */}

        <section className="relatedWorks">
          <div className="relatedHeader">
            <h3>Obras relacionadas</h3>

            <button className="relatedViewAll" type="button">
              Ver todas
            </button>
          </div>

          <div className="relatedRail">{/* cards futuramente */}</div>
        </section>
      </div>
    </div>
  );
}
