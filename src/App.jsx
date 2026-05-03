import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import "./styles/global.css";

import Loader from "./components/Loader.jsx";
import Header from "./components/Header.jsx";
import HomeHero from "./components/HomeHero.jsx";
import SeriesCard from "./components/SeriesCard.jsx";
import ProductCard from "./components/ProductCard.jsx";
import ProductModal from "./components/ProductModal.jsx";
import LaunchRail from "./components/LaunchRail.jsx";
import PromoRail from "./components/PromoRail.jsx";
import CheapRail from "./components/CheapRail.jsx";
import BrandStats from "./components/BrandStats";
import SectionHeader from "./components/SectionHeader.jsx";
import ActiveFiltersBar from "./components/ActiveFiltersBar.jsx";
import FiltersPage from "./pages/FiltersPage";
import CollectionHero, {
  CollectionsHero,
} from "./components/CollectionHero.jsx";

import { useIsMobile } from "./hooks/useIsMobile";
import { normalizeProduct } from "./utils/normalizeProduct";

import { supabaseClient } from "./lib/supabase.js";
import { getSeriesCatalog } from "./data/products/series.catalog.js";

import { useSeriesList } from "./hooks/useSeriesList";
import { useScrollTop } from "./hooks/useScrollTop";

import {
  parseQuery,
  pickSeriesFromQuery,
  productSearchText,
  slugify,
} from "./utils/search";
import Footer from "./components/Footer";

const norm = (v) => String(v || "").trim();
const normLc = (v) => norm(v).toLowerCase();

function asList(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(norm);
  return [norm(v)].filter(Boolean);
}

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

function getBestPrice(p) {
  const price = p.best_price ?? p.amazon_price ?? p.mercado_livre_price ?? null;

  const n = Number(price);
  return Number.isFinite(n) ? n : null;
}

function priceNumber(p) {
  const value = best?.value;

  if (typeof value === "number" && Number.isFinite(value)) return value;

  const raw = p?.priceNumber ?? p?.price ?? p?.value ?? p?.currentPrice;
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;

  const s = String(raw)
    .replace(/\./g, "")
    .replace(",", ".")
    .match(/[\d.]+/);
  if (!s) return null;

  const n = Number(s[0]);
  return Number.isFinite(n) ? n : null;
}

function hasReview(p) {
  return Boolean(
    p?.tiktok ||
    p?.tiktokUrl ||
    p?.video ||
    p?.videoUrl ||
    p?.tiktokId ||
    p?.review ||
    p?.reviewText ||
    p?.reviewTitle ||
    p?.reviewContent ||
    p?.reviews?.length,
  );
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { seriesSlug, volumeId } = useParams();
  const [sp, setSp] = useSearchParams();

  const isAllCollectionsPage = location.pathname === "/colecoes";
  const isMobile = useIsMobile();

  const [page, setPage] = useState(1);
  const [seriesPage, setSeriesPage] = useState(1);

  const lastAppliedQueryRef = useRef("");
  const collectionsSectionRef = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [activeSeries, setActiveSeries] = useState(null);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [activeSection, setActiveSection] = useState("colecoes");

  const { showScrollTop, scrollToTop } = useScrollTop(400);
  const [seriesCatalog, setSeriesCatalog] = useState([]);
  const [products, setProducts] = useState([]);
  const { seriesList, seriesBySlug, seriesNames } = useSeriesList(
    products || [],
    seriesCatalog || [],
  );

  const [shouldScrollToVolumes, setShouldScrollToVolumes] = useState(false);

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
  }, [seriesCatalog]);

  const getMeta = (p) => {
    const seriesName = norm(p?.series);
    const m = metaBySeries.get(seriesName) || {};
    return {
      brand: asList(p?.brand).length ? asList(p?.brand) : m.brand || [],
      author: asList(p?.author).length ? asList(p?.author) : m.author || [],
      genre: asList(p?.genre).length ? asList(p?.genre) : m.genre || [],
      format: asList(p?.format).length ? asList(p?.format) : m.format || [],
    };
  };

  const qParam = sp.get("q") || "";
  const brandParam = sp.getAll("brand");
  const authorParam = sp.getAll("author");
  const genreParam = sp.getAll("genre");
  const formatParam = sp.getAll("format");
  const priceParam = sp.get("price") || "";
  const discountParam = sp.get("discount") || "";
  const stParam = sp.get("st") || "";
  const rvParam = sp.get("rv") || "";
  const sortParam = sp.get("sort") || "relevance";

  const hasAnyFilter =
    (qParam && qParam.trim().length > 0) ||
    brandParam.length > 0 ||
    authorParam.length > 0 ||
    genreParam.length > 0 ||
    formatParam.length > 0 ||
    priceParam ||
    discountParam ||
    stParam ||
    rvParam === "1" ||
    (sortParam && sortParam !== "relevance");

  const isFiltering = hasAnyFilter && !activeSeries;

  const isCollectionPage = Boolean(seriesSlug && !volumeId);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabaseClient
        .from("series_volumes_view")
        .select("*");

      if (error) {
        console.error("Erro Supabase:", error);
        return;
      }

      console.log("🔥 DATA SUPABASE:", data?.[0]);

      setProducts((data || []).map(normalizeProduct));
    }

    getSeriesCatalog().then(setSeriesCatalog);
    load();
  }, [location.search]);

  useEffect(() => {
    if (!shouldScrollToVolumes) return;

    const tryScroll = () => {
      const el = document.getElementById("volumes");
      if (!el) {
        requestAnimationFrame(tryScroll); // 🔥 tenta de novo
        return;
      }

      const header = document.querySelector(".heroHeader");
      const headerHeight = header?.offsetHeight || 80;

      const top = el.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: top - headerHeight - 8,
        behavior: "smooth",
      });

      setShouldScrollToVolumes(false);
    };

    tryScroll();
  }, [location.pathname, shouldScrollToVolumes]);

  useEffect(() => {
    setInputValue(qParam);
  }, [qParam]);

  useEffect(() => {
    if (!seriesSlug) {
      setActiveSeries(null);
      return;
    }
    if (volumeId) return;

    const name = seriesBySlug.get(seriesSlug) || null;
    setActiveSeries(name);
  }, [seriesSlug, volumeId, seriesBySlug]);

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

    setPage(1);

    navigate(`/${slugify(picked)}${sp.toString() ? `?${sp.toString()}` : ""}`);

    setTimeout(() => {
      document.getElementById("volumes")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }, [qParam, seriesNames, navigate, sp]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (seriesCatalog.length && products.length) {
      // dados carregaram → espera 6s antes de liberar
      const timer = setTimeout(() => {
        setLoading(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [seriesCatalog, products]);

  const foundSeries = useMemo(() => {
    if (!qParam) return null;

    return pickSeriesFromQuery(
      qParam,
      seriesNames.map((name) => ({ name })),
    );
  }, [qParam, seriesNames]);

  const baseFiltered = useMemo(() => {
    const { words, numbers } = parseQuery(qParam);

    return products
      .filter((p) => {
        // 🔥 PRIORIDADE TOTAL PARA SEARCH
        if (foundSeries) {
          return p.series === foundSeries;
        }

        // depois fallback
        if (activeSeries) {
          return (p.series || "Outros") === activeSeries;
        }

        // 🔥 AQUI É A MÁGICA
        if (foundSeries) {
          return p.series === foundSeries;
        }

        return true;
      })

      .filter((p) => {
        // 🔥 SE JÁ ACHOU A SÉRIE, IGNORA O RESTO
        if (foundSeries) return true;

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

          return words.every((w) => {
            if (w.length <= 2) return true;
            const parts = text.split(" ");
            return text.includes(w) || parts.some((tok) => tok.startsWith(w));
          });
        }

        return true;
      });
  }, [products, qParam, activeSeries]);

  const filtered = useMemo(() => {
    const spString = sp.toString();
    let arr = [...baseFiltered];

    //arr = arr.filter((p) => p.best_price != null);

    const brandSet = brandParam.length ? new Set(brandParam.map(normLc)) : null;
    const authorSet = authorParam.length
      ? new Set(authorParam.map(normLc))
      : null;
    const genreSet = genreParam.length ? new Set(genreParam.map(normLc)) : null;
    const formatSet = formatParam.length
      ? new Set(formatParam.map(normLc))
      : null;

    const maxPrice = priceParam ? Number(priceParam) : null;
    const minDiscount = discountParam ? Number(discountParam) : null;

    if (brandSet)
      arr = arr.filter((p) =>
        getMeta(p).brand.some((b) => brandSet.has(normLc(b))),
      );
    if (authorSet)
      arr = arr.filter((p) =>
        getMeta(p).author.some((a) => authorSet.has(normLc(a))),
      );
    if (genreSet)
      arr = arr.filter((p) =>
        getMeta(p).genre.some((g) => genreSet.has(normLc(g))),
      );
    if (formatSet)
      arr = arr.filter((p) =>
        getMeta(p).format.some((f) => formatSet.has(normLc(f))),
      );

    if (Number.isFinite(maxPrice)) {
      arr = arr.filter((p) => {
        // ❌ remove tudo que não tem preço
        if (p.best_price == null) return false;

        const price = Number(p.best_price);

        // ❌ remove inválido
        if (!Number.isFinite(price)) return false;

        // ✅ só entra se for menor ou igual ao filtro
        return price <= maxPrice;
      });
    }

    if (Number.isFinite(minDiscount)) {
      arr = arr.filter((p) => {
        return p.discount != null && p.discount >= minDiscount;
      });
    }

    if (stParam === "in") arr = arr.filter((p) => hasAnyAffiliateLink(p));
    if (stParam === "out") arr = arr.filter((p) => !hasAnyAffiliateLink(p));
    if (rvParam === "1") arr = arr.filter((p) => hasReview(p));

    const sort = sortParam || "relevance";
    if (sort === "price_asc") {
      arr.sort(
        (a, b) =>
          (Number(a.best_price) || 1e15) - (Number(b.best_price) || 1e15),
      );
    } else if (sort === "price_desc") {
      arr.sort(
        (a, b) => (Number(b.best_price) || -1) - (Number(a.best_price) || -1),
      );
    } else if (sort === "new") {
      arr.sort((a, b) => {
        const da = new Date(
          a?.date || a?.releasedAt || a?.createdAt || 0,
        ).getTime();
        const db = new Date(
          b?.date || b?.releasedAt || b?.createdAt || 0,
        ).getTime();
        return db - da;
      });
    } else {
      arr.sort((a, b) => Number(a.volume ?? 0) - Number(b.volume ?? 0));
    }

    return arr;
  }, [
    baseFiltered,
    brandParam,
    authorParam,
    genreParam,
    formatParam,
    priceParam,
    discountParam,
    stParam,
    rvParam,
    sortParam,
  ]);

  useEffect(() => {
    setPage(1);
  }, [location.search]);

  const [seriesPageSize, setSeriesPageSize] = useState(6);
  const [pageSize, setPageSize] = useState(6);

  const pagedProducts = filtered.slice(0, page * pageSize);

  const hasMore = pagedProducts.length < filtered.length;

  const totalSeriesPages = useMemo(
    () => Math.max(1, Math.ceil(seriesList.length / seriesPageSize)),
    [seriesList.length, seriesPageSize],
  );

  const visibleSeriesList = useMemo(() => {
    const start = (seriesPage - 1) * seriesPageSize;
    return seriesList.slice(start, start + seriesPageSize);
  }, [seriesList, seriesPage, seriesPageSize]);

  useEffect(() => {
    const updateSizes = () => {
      const w = window.innerWidth;

      if (w >= 1200) {
        setSeriesPageSize(10);
        setPageSize(10);
      } else if (w >= 768) {
        setSeriesPageSize(8);
        setPageSize(8);
      } else {
        setSeriesPageSize(6);
        setPageSize(6);
      }
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);

    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  const seriesPageDots = useMemo(() => {
    return Array.from({ length: totalSeriesPages }, (_, i) => i + 1);
  }, [totalSeriesPages]);

  const seriesToRender = isMobile
    ? seriesList // 🔥 mobile = scroll infinito
    : isAllCollectionsPage
      ? seriesList
      : visibleSeriesList;

  const updateSearchParams = (patch) => {
    const next = new URLSearchParams(sp);

    Object.entries(patch).forEach(([k, v]) => {
      if (v == null || String(v).trim() === "") next.delete(k);
      else next.set(k, String(v));
    });

    setSp(next, { replace: true });
  };

  const selectedProduct = useMemo(() => {
    if (!volumeId) return null;

    return (
      products.find((p) => {
        const slug = p.url?.split("/").pop(); // pega "gb-04"
        return slug === volumeId;
      }) || null
    );
  }, [volumeId, products]);

  const openSeries = (name) => {
    setPage(1);
    setShouldScrollToVolumes(true);

    const slug = slugify(name);
    const qs = sp.toString();
    navigate(`/${slug}${qs ? `?${qs}` : ""}`);
  };

  const clearSeries = () => {
    setPage(1);

    navigate("/", {
      replace: true,
      state: { scrollTo: "railTitle" },
    });
  };

  const openProduct = (product) => {
    if (!product?.url) {
      console.warn("🚨 Produto sem URL:", product);
      return;
    }

    const qs = sp.toString();
    const backgroundPath = `${location.pathname}${location.search || ""}`;

    navigate(`${product.url}${qs ? `?${qs}` : ""}`, {
      state: { backgroundPath },
    });
  };

  const closeModal = () => {
    const backgroundPath = location.state?.backgroundPath;

    if (backgroundPath) {
      navigate(backgroundPath, { replace: true });
      return;
    }

    const qs = sp.toString();

    if (seriesSlug && !volumeId) {
      navigate(`/${seriesSlug}${qs ? `?${qs}` : ""}`, { replace: true });
      return;
    }

    if (activeSeries) {
      navigate(`/${slugify(activeSeries)}${qs ? `?${qs}` : ""}`, {
        replace: true,
      });
      return;
    }

    navigate(`/${qs ? `?${qs}` : ""}`, { replace: true });
  };

  const scrollToIdWithOffset = useCallback((id, behavior = "smooth") => {
    const el = document.getElementById(id);
    if (!el) return false;

    const header = document.querySelector(".heroHeader");

    // 🔥 pega a posição real do header na tela
    const headerBottom = header?.getBoundingClientRect().bottom || 0;

    const top =
      el.getBoundingClientRect().top + window.scrollY - headerBottom - 8;

    window.scrollTo({
      top: Math.max(0, top),
      behavior,
    });

    return true;
  }, []);

  const resolveScrollIds = useCallback((target, fallbackIds = []) => {
    const map = {
      colecoes: ["railTitle", "obras", "collectionsSection"],
      lancamentos: ["lancamentos", "releasesSection", "obras"],
      promocoes: ["promotions", "promocoes", "deals"],
      saldao: ["deals", "saldao", "baratinhos"],
      home: ["home"],
      top: ["top"],
    };

    return [...(map[target] || []), ...fallbackIds].filter(Boolean);
  }, []);

  const scrollToNav = useCallback(
    ({ target, ids = [] } = {}) => {
      const targetIds = resolveScrollIds(target, ids);
      const routeHasSeriesContext = Boolean(
        seriesSlug || volumeId || activeSeries,
      );

      // 👉 Se não estamos na home, navega e deixa o useEffect cuidar do scroll
      if (location.pathname !== "/") {
        navigate("/", {
          state: { scrollTo: target },
        });
        return;
      }

      const performScroll = () => {
        for (const id of targetIds) {
          if (scrollToIdWithOffset(id)) return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      };

      if (routeHasSeriesContext && location.pathname !== "/") {
        navigate(`/${location.search || ""}`);
        window.requestAnimationFrame(() => {
          window.setTimeout(performScroll, 80);
        });
        return;
      }

      performScroll();
    },
    [
      activeSeries,
      location.pathname,
      location.search,
      navigate,
      resolveScrollIds,
      scrollToIdWithOffset,
      seriesSlug,
      volumeId,
    ],
  );

  const changeSeriesPage = useCallback(
    (nextPage) => {
      const safePage = Math.max(1, Math.min(totalSeriesPages, nextPage));
      setSeriesPage(safePage);

      if (collectionsSectionRef.current) {
        const extraOffset = isHeaderCompact ? 96 : 132;

        const top =
          collectionsSectionRef.current.getBoundingClientRect().top +
          window.scrollY -
          extraOffset;

        window.scrollTo({
          top: Math.max(0, top),
          behavior: "smooth",
        });
      }
    },
    [isHeaderCompact, totalSeriesPages],
  );

  // quando fecha uma coleção, tenta scroll pro menu de coleções
  useEffect(() => {
    if (!location.state?.scrollTo) return;

    const targetId = location.state.scrollTo;

    requestAnimationFrame(() => {
      scrollToIdWithOffset(targetId);
    });
  }, [location]);

  // 🔥 quando entra na página de coleção, já tenta scroll pro banner
  useEffect(() => {
    if (isCollectionPage && !location.state?.scrollTo) {
      requestAnimationFrame(() => {
        scrollToIdWithOffset("collection-hero");
      });
    }
  }, [seriesSlug, location.state]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(seriesList.length / seriesPageSize));

    if (seriesPage > maxPage) {
      setSeriesPage(maxPage);
    }
  }, [seriesList.length, seriesPage, seriesPageSize]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setIsHeaderCompact(y > 50);

      const sections = [
        { key: "lancamentos", ids: ["lancamentos"] },
        { key: "promocoes", ids: ["promotions"] },
        { key: "saldao", ids: ["deals"] },
        { key: "colecoes", ids: ["railTitle", "obras"] },
      ];

      let current = "colecoes";
      for (const section of sections) {
        const el = section.ids
          .map((id) => document.getElementById(id))
          .find(Boolean);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 180) current = section.key;
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (loading) {
    return <Loader />;
  }

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
        scrollToNav={scrollToNav}
        activeSection={activeSection}
        isHeaderCompact={isHeaderCompact}
      />

      <HomeHero isHeaderCompact={isHeaderCompact} />

      <section className="brandBlock">
        <div className="brandHeader">
          <h2 className="brandTitle">Mangá Drops no TikTok</h2>
          <p className="brandSubtitle">
            Reviews, indicações e novidades toda semana.
          </p>
        </div>
        <BrandStats />
      </section>

      {!isCollectionPage && !isAllCollectionsPage && (
        <section id="home" className="chapterBlock">
          <div className="chapterHeader">
            <div className="chapterTop">
              <h1 className="chapterTitle">Mangás Disponíveis</h1>

              <p className="chapterDesc">
                Veja os mangás disponíveis em estoque com preços atualizados e
                novas reposições.
              </p>

              {/* SEO escondido */}
              <h1 className="seoTitle">
                Mangás à Venda | One Piece, Jujutsu Kaisen e mais
              </h1>
            </div>

            <ActiveFiltersBar />

            <div className="chapterLine" aria-hidden="true" />
          </div>
        </section>
      )}

      {isCollectionPage && (
        <CollectionHero
          seriesSlug={seriesSlug}
          title={activeSeries}
          total={filtered.length}
          onBack={clearSeries}
        />
      )}

      {isAllCollectionsPage && (
        <CollectionsHero
          title="Coleções"
          total={seriesList.length}
          onBack={clearSeries}
        />
      )}

      {isAllCollectionsPage && !isCollectionPage && !isFiltering && (
        <div
          className={isAllCollectionsPage ? "collectionsGrid" : "seriesRail"}
        >
          {(isAllCollectionsPage ? seriesList : seriesToRender).map((s) => (
            <div
              className={isAllCollectionsPage ? "" : "railItem"}
              key={s.name}
            >
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
      )}

      {isFiltering && !isCollectionPage && (
        <section id="volumes" className="volumesSection">
          <section className="grid">
            {pagedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={openProduct} />
            ))}
          </section>

          {hasMore && (
            <div className="showMoreRow">
              <button
                className="btn showMoreBtn"
                onClick={() => setPage((prev) => prev + 1)}
              >
                Mostrar mais {pageSize}
              </button>
              <div className="showMoreHint">
                Exibindo {pagedProducts.length}/{filtered.length}
              </div>
            </div>
          )}
        </section>
      )}

      {!isCollectionPage && !isFiltering && !isAllCollectionsPage && (
        <section className="railBlock" id="obras">
          <div id="lancamentos">
            <LaunchRail
              title="Lançamentos 🔥"
              products={products}
              limit={40}
              initialVisible={20}
              onOpenProduct={openProduct}
            />
          </div>

          <div className="sectionBreak" aria-hidden="true">
            <span className="sectionBreakLine" />
          </div>

          <div id="promotions">
            <PromoRail
              id="promotions"
              title="Promoções 💸"
              products={products}
              limit={40}
              onOpenProduct={openProduct}
            />
          </div>

          <div className="sectionBreak" aria-hidden="true">
            <span className="sectionBreakLine" />
          </div>

          <div id="deals">
            <CheapRail
              id="deals"
              title="Baratinhos da galera 🪙"
              subtitle="Mangás por até R$30."
              products={products}
              limit={40}
              onOpenProduct={openProduct}
            />
          </div>

          <div className="sectionBreak" aria-hidden="true">
            <span className="sectionBreakLine" />
          </div>

          <section
            className="collectionsSection"
            id="railTitle"
            ref={collectionsSectionRef}
          >
            {!isAllCollectionsPage && (
              <SectionHeader
                title="Coleções 📚"
                subtitle="Explore por obra e veja os volumes disponíveis."
              />
            )}
            <>
              {isAllCollectionsPage && (
                <CollectionsHero
                  total={seriesList.length}
                  onBack={clearSeries}
                />
              )}
              {!isAllCollectionsPage && (
                <div className="collectionsTopbar">
                  <div className="collectionsTopbarLeft">
                    <span className="collectionsEyebrow">Catálogo</span>
                    <div className="collectionsMeta">
                      Página <strong>{seriesPage}</strong> de{" "}
                      <strong>{totalSeriesPages}</strong>
                    </div>
                  </div>

                  <div className="collectionsTopbarRight">
                    <button
                      className="seeAllBtn"
                      onClick={() =>
                        navigate("/colecoes", {
                          state: { scrollTo: "collection-hero" },
                        })
                      }
                    >
                      Ver todas →
                    </button>

                    <div className="collectionsPager">
                      <button
                        type="button"
                        className="collectionsNavBtn"
                        onClick={() => changeSeriesPage(seriesPage - 1)}
                        disabled={seriesPage === 1}
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        className="collectionsNavBtn"
                        onClick={() => changeSeriesPage(seriesPage + 1)}
                        disabled={seriesPage === totalSeriesPages}
                      >
                        ›
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="seriesRail">
                {seriesToRender.map((s) => (
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

              {!isAllCollectionsPage && totalSeriesPages > 1 && (
                <div className="collectionsBottomBar">
                  <div className="collectionsDots">
                    {seriesPageDots.map((dotPage) => (
                      <button
                        key={dotPage}
                        className={`collectionsDot ${
                          dotPage === seriesPage ? "isActive" : ""
                        }`}
                        onClick={() => changeSeriesPage(dotPage)}
                      />
                    ))}
                  </div>

                  <div className="collectionsCounter">
                    Exibindo{" "}
                    <strong>{(seriesPage - 1) * seriesPageSize + 1}</strong>–
                    <strong>
                      {Math.min(seriesPage * seriesPageSize, seriesList.length)}
                    </strong>{" "}
                    de <strong>{seriesList.length}</strong> obras
                  </div>
                </div>
              )}
            </>
          </section>
        </section>
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
              <button
                className="btn showMoreBtn"
                onClick={() => setPage((prev) => prev + 1)}
              >
                Mostrar mais {pageSize}
              </button>
              <div className="showMoreHint">
                Exibindo {pagedProducts.length}/{filtered.length}
              </div>
            </div>
          )}
        </section>
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={closeModal} />
      )}

      {showScrollTop && (
        <button
          className="scrollTopBtn"
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
          ↑
        </button>
      )}

      <Footer scrollToNav={scrollToNav} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/filtros" element={<FiltersPage />} />
      <Route path="/colecoes" element={<AppShell isAllCollectionsPage />} />
      <Route path="/" element={<AppShell />} />
      <Route path="/:seriesSlug" element={<AppShell />} />
      <Route path="/:seriesSlug/:volumeId" element={<AppShell />} />
    </Routes>
  );
}
