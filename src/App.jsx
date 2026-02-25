import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./styles/global.css";

import Header from "./components/Header";
import HomeHero from "./components/HomeHero";
import SeriesCard from "./components/SeriesCard";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import LaunchRail from "./components/LaunchRail";
import BrandStats from "./components/BrandStats";
import SectionHeader from "./components/SectionHeader";
import ActiveFiltersBar from "./components/ActiveFiltersBar";

import FiltersPage from "./pages/FiltersPage";

import { products } from "./data/products/index.js";
import { seriesCatalog } from "./data/products/series.catalog.js";

import { useSeriesList } from "./hooks/useSeriesList";
import { useScrollTop } from "./hooks/useScrollTop";

import { parseQuery, pickSeriesFromQuery, productSearchText, slugify } from "./utils/search";

/* =======================================================
   helpers (robustos)
======================================================= */
const norm = (v) => String(v || "").trim();
const normLc = (v) => norm(v).toLowerCase();

function asList(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(norm);
  return [norm(v)].filter(Boolean);
}

// estoque = existe link amazon OU ML
function hasAnyAffiliateLink(p) {
  const amazon =
    p?.amazon ||
    p?.amazonLink ||
    p?.links?.amazon ||
    p?.affiliate?.amazon ||
    p?.affiliateLinks?.amazon ||
    p?.afiliado?.amazon;

  const ml =
    p?.mercadoLivre ||
    p?.mercadoLivreLink ||
    p?.links?.mercadoLivre ||
    p?.affiliate?.mercadoLivre ||
    p?.affiliateLinks?.mercadoLivre ||
    p?.afiliado?.mercadoLivre;

  return Boolean(amazon || ml);
}

function priceNumber(p) {
  const raw = p?.priceNumber ?? p?.price ?? p?.value ?? p?.currentPrice;
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;

  const s = String(raw).replace(/\./g, "").replace(",", ".").match(/[\d.]+/);
  if (!s) return null;
  const n = Number(s[0]);
  return Number.isFinite(n) ? n : null;
}

// review = existe tiktokByVolume pra série+volume (ou link direto no produto)
function hasReview(p) {
  return Boolean(
    p?.tiktok ||
    p?.tiktokUrl ||
    p?.video ||
    p?.videoUrl ||
    p?.tiktokId
  );
}

/* =======================================================
   APP SHELL (home + séries + modal)
======================================================= */
function AppShell() {
  const PAGE_SIZE = 12;
  const navigate = useNavigate();
  const { seriesSlug, volumeId } = useParams();
  const [sp, setSp] = useSearchParams();

  const [page, setPage] = useState(1);
  const lastAppliedQueryRef = useRef("");

  // input controlado no Header
  const [inputValue, setInputValue] = useState("");

  const [selected, setSelected] = useState(null);
  const [activeSeries, setActiveSeries] = useState(null);

  const { showScrollTop, scrollToTop } = useScrollTop(400);

  const { seriesList, seriesBySlug, seriesNames } = useSeriesList(products, seriesCatalog);

  // =======================================================
  // meta fallback por série (usa seriesCatalog)
  // =======================================================
  const metaBySeries = useMemo(() => {
    const map = new Map();
    for (const s of seriesCatalog || []) {
      const key = norm(s?.name);
      if (!key) continue;
      map.set(key, {
        brand: asList(s?.brand),
        author: asList(s?.author),
        genre: asList(s?.genre),
        format: asList(s?.format),
      });
    }
    return map;
  }, []);

  const getMeta = (p) => {
    const seriesName = norm(p?.series);
    const m = metaBySeries.get(seriesName) || {};
    return {
      brand: asList(p?.brand).length ? asList(p?.brand) : (m.brand || []),
      author: asList(p?.author).length ? asList(p?.author) : (m.author || []),
      genre: asList(p?.genre).length ? asList(p?.genre) : (m.genre || []),
      format: asList(p?.format).length ? asList(p?.format) : (m.format || []),
    };
  };

  // =======================================================
  // URL params (fonte de verdade dos filtros)
  // =======================================================
  const qParam = sp.get("q") || "";

  const brandParam = sp.getAll("brand");
  const authorParam = sp.getAll("author");
  const genreParam = sp.getAll("genre");
  const formatParam = sp.getAll("format");

  const stParam = sp.get("st") || ""; // "in" | "out" | ""
  const rvParam = sp.get("rv") || ""; // "1" | ""
  const sortParam = sp.get("sort") || "relevance";

  const hasAnyFilter =
    (qParam && qParam.trim().length > 0) ||
    brandParam.length > 0 ||
    authorParam.length > 0 ||
    genreParam.length > 0 ||
    formatParam.length > 0 ||
    !!stParam ||
    rvParam === "1" ||
    (sortParam && sortParam !== "relevance");

  // mantém o input do Header sincronizado com a URL
  useEffect(() => {
    setInputValue(qParam);
  }, [qParam]);

  // Sync: rota -> activeSeries
  useEffect(() => {
    if (!seriesSlug) {
      setActiveSeries(null);
      setSelected(null);
      return;
    }
    const name = seriesBySlug.get(seriesSlug) || null;
    setActiveSeries(name);
  }, [seriesSlug, seriesBySlug]);

  // =======================================================
  // Busca que “pula” pra série (mantém seu comportamento)
  // =======================================================
  useEffect(() => {
    const q = (qParam || "").trim();
    if (!q) {
      lastAppliedQueryRef.current = "";
      return;
    }
    if (q === lastAppliedQueryRef.current) return;
    lastAppliedQueryRef.current = q;

    const picked = pickSeriesFromQuery(q, seriesNames);
    if (!picked) return;

    setSelected(null);
    setPage(1);

    navigate(`/${slugify(picked)}${sp.toString() ? `?${sp.toString()}` : ""}`);

    setTimeout(() => {
      document.getElementById("volumes")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam, seriesNames, navigate]);

  // =======================================================
  // Base: série + busca
  // =======================================================
  const baseFiltered = useMemo(() => {
    const { words, numbers } = parseQuery(qParam);

    return products
      .filter((p) => (activeSeries ? (p.series || "Outros") === activeSeries : true))
      .filter((p) => {
        if (!words.length && !numbers.length) return true;

        const text = productSearchText(p);

        if (numbers.length) {
          const v = Number(p.volume);
          if (!Number.isFinite(v)) return false;
          if (!numbers.includes(v)) return false;
        }

        if (words.length) {
          const okAll = words.every((w) => text.includes(w));
          if (okAll) return true;

          const okPartial = words.every((w) => {
            if (w.length <= 2) return true;
            const parts = text.split(" ");
            return text.includes(w) || parts.some((tok) => tok.startsWith(w));
          });

          return okPartial;
        }

        return true;
      });
  }, [qParam, activeSeries]);

  // =======================================================
  // Aplicar filtros URL: brand/author/genre/format + st/rv + ordenar
  // =======================================================
  const filtered = useMemo(() => {
    let arr = [...baseFiltered];

    const brandSet = brandParam.length ? new Set(brandParam.map(normLc)) : null;
    const authorSet = authorParam.length ? new Set(authorParam.map(normLc)) : null;
    const genreSet = genreParam.length ? new Set(genreParam.map(normLc)) : null;
    const formatSet = formatParam.length ? new Set(formatParam.map(normLc)) : null;

    if (brandSet) {
      arr = arr.filter((p) => getMeta(p).brand.some((b) => brandSet.has(normLc(b))));
    }
    if (authorSet) {
      arr = arr.filter((p) => getMeta(p).author.some((a) => authorSet.has(normLc(a))));
    }
    if (genreSet) {
      arr = arr.filter((p) => getMeta(p).genre.some((g) => genreSet.has(normLc(g))));
    }
    if (formatSet) {
      arr = arr.filter((p) => getMeta(p).format.some((f) => formatSet.has(normLc(f))));
    }

    // st (estoque por link)
    if (stParam === "in") arr = arr.filter((p) => hasAnyAffiliateLink(p));
    if (stParam === "out") arr = arr.filter((p) => !hasAnyAffiliateLink(p));

    // rv (com review)
    if (rvParam === "1") arr = arr.filter((p) => hasReview(p));

    // ordenar
    const sort = sortParam || "relevance";
    if (sort === "price_asc") {
      arr.sort((a, b) => (priceNumber(a) ?? 1e15) - (priceNumber(b) ?? 1e15));
    } else if (sort === "price_desc") {
      arr.sort((a, b) => (priceNumber(b) ?? -1) - (priceNumber(a) ?? -1));
    } else if (sort === "new") {
      arr.sort((a, b) => {
        const da = new Date(a?.date || a?.releasedAt || a?.createdAt || 0).getTime();
        const db = new Date(b?.date || b?.releasedAt || b?.createdAt || 0).getTime();
        return db - da;
      });
    } else {
      arr.sort((a, b) => Number(a.volume ?? 0) - Number(b.volume ?? 0));
    }

    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    baseFiltered,
    brandParam.join("|"),
    authorParam.join("|"),
    genreParam.join("|"),
    formatParam.join("|"),
    stParam,
    rvParam,
    sortParam,
  ]);

  const pagedProducts = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = pagedProducts.length < filtered.length;

  const showGlobalResults = !activeSeries && hasAnyFilter;

  // =======================================================
  // URL helpers
  // =======================================================
  const updateSearchParams = (patch) => {
    const next = new URLSearchParams(sp);

    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || String(v).trim() === "") next.delete(k);
      else next.set(k, String(v));
    });

    setSp(next, { replace: true });
  };

  // =======================================================
  // Modal via rota
  // =======================================================
  useEffect(() => {
    if (!volumeId) {
      setSelected(null);
      return;
    }
    const prod = filtered.find((p) => p.id === volumeId) || null;
    setSelected(prod);
  }, [volumeId, filtered]);

  const openSeries = (name) => {
    setPage(1);
    setSelected(null);

    const slug = slugify(name);
    const qs = sp.toString();
    navigate(`/${slug}${qs ? `?${qs}` : ""}`);

    setTimeout(() => {
      document.getElementById("volumes")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const clearSeries = () => {
    setPage(1);
    setSelected(null);

    const qs = sp.toString();
    navigate(`/${qs ? `?${qs}` : ""}`, { replace: true });

    setTimeout(() => {
      document.getElementById("obras")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const openProduct = (product) => {
    setSelected(product);

    const seriesName = product?.series || activeSeries;
    const parentSlug = seriesSlug || (seriesName ? slugify(seriesName) : null);
    const qs = sp.toString();

    if (parentSlug) {
      navigate(`/${parentSlug}/${product.id}${qs ? `?${qs}` : ""}`);
      return;
    }

    navigate(`/${product.id}${qs ? `?${qs}` : ""}`);
  };

  const closeModal = () => {
    setSelected(null);
    const qs = sp.toString();

    if (seriesSlug) {
      navigate(`/${seriesSlug}${qs ? `?${qs}` : ""}`, { replace: true });
      return;
    }

    if (activeSeries) {
      navigate(`/${slugify(activeSeries)}${qs ? `?${qs}` : ""}`, { replace: true });
      return;
    }

    navigate(`/${qs ? `?${qs}` : ""}`, { replace: true });
  };

  return (
    <div className="container">
      <Header
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSearch={(override) => {
          const q = typeof override === "string" ? override : inputValue;
          setPage(1);
          updateSearchParams({ q });
        }}
      />

      <HomeHero />

      <section className="brandBlock">
        <div className="brandHeader">
          <h2 className="brandTitle">Mangá Drops no TikTok</h2>
          <p className="brandSubtitle">Reviews, indicações e novidades toda semana.</p>
        </div>
        <BrandStats />
      </section>

      <section id="home" className="chapterBlock">
        <div className="chapterHeader">
          <div className="chapterTop">
            <h1 className="chapterTitle">Mangás Disponíveis</h1>
          </div>
          

          <p className="chapterDesc">
            {!activeSeries
              ? "Confira os volumes em estoque e garanta o seu antes que esgote. Atualizado com lançamentos e reposições recentes."
              : "Adquira seu mangá preferido com os melhores preços do mercado. Links atualizados."}
          </p>

          <ActiveFiltersBar />

          <div className="chapterLine" aria-hidden="true" />
        </div>
      </section>

      {/* RESULTADOS GLOBAIS (HOME) via URL */}
      {!activeSeries && showGlobalResults && (
        <section id="volumes" className="volumesSection">
          <section className="grid">
            {pagedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={openProduct} />
            ))}
          </section>

          {hasMore && (
            <div className="showMoreRow">
              <button className="btn showMoreBtn" onClick={() => setPage((prev) => prev + 1)}>
                Mostrar mais {PAGE_SIZE}
              </button>
              <div className="showMoreHint">
                Exibindo {pagedProducts.length}/{filtered.length}
              </div>
            </div>
          )}
        </section>
      )}

      {!activeSeries && (
        <section className="railBlock" id="obras">
          <LaunchRail title="Lançamentos 🔥" products={products} limit={30} onOpenProduct={openProduct} />

          <div className="sectionBreak" aria-hidden="true">
            <span className="sectionBreakLine" />
          </div>

          <section className="collectionsSection" id="railTitle">
            <SectionHeader title="Coleções 📚" subtitle="Explore por obra e veja os volumes disponíveis." />

            <div className="seriesRail">
              {seriesList.map((s) => (
                <div className="railItem" key={s.name}>
                  <SeriesCard
                    name={s.name}
                    thumb={s.thumb}
                    subtitle={s.subtitle}
                    rangeLabel={s.rangeLabel}
                    haveLabel={s.haveLabel}
                    statusLabel={s.statusLabel}
                    missing={s.missing}
                    missingCount={s.missingCount}
                    active={activeSeries === s.name}
                    onOpen={openSeries}
                  />
                </div>
              ))}
            </div>
          </section>
        </section>
      )}

      {activeSeries && (
        <div id="volumes" className="backRow">
          <button className="btn ghost backButton" onClick={clearSeries}>
            ← Voltar para obras
          </button>

          <div className="infoTag">
            <span>Exibindo</span>
            <strong>{activeSeries}</strong>
            <span>
              • {pagedProducts.length}/{filtered.length} volume(s)
            </span>
          </div>
        </div>
      )}

      {activeSeries && (
        <section className="volumesSection">
          <section className="grid">
            {pagedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={openProduct} />
            ))}
          </section>

          {hasMore && (
            <div className="showMoreRow">
              <button className="btn showMoreBtn" onClick={() => setPage((prev) => prev + 1)}>
                Mostrar mais {PAGE_SIZE}
              </button>
              <div className="showMoreHint">
                Exibindo {pagedProducts.length}/{filtered.length}
              </div>
            </div>
          )}
        </section>
      )}

      {selected && <ProductModal product={selected} onClose={closeModal} />}

      {showScrollTop && (
        <button className="scrollTopBtn" onClick={scrollToTop} aria-label="Voltar ao topo" title="Voltar ao topo">
          ↑
        </button>
      )}
    </div>
  );
}

/* =======================================================
   ROTAS
======================================================= */
export default function App() {
  return (
    <Routes>
      <Route path="/filtros" element={<FiltersPage />} />
      <Route path="/" element={<AppShell />} />
      <Route path="/:seriesSlug" element={<AppShell />} />
      <Route path="/:seriesSlug/:volumeId" element={<AppShell />} />
    </Routes>
  );
}