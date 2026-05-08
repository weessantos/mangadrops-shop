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
import CollectionsRail from "./components/CollectionsRail.jsx";
import BrandStats from "./components/BrandStats.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import SectionHeader from "./components/SectionHeader.jsx";
import ActiveFiltersBar from "./components/ActiveFiltersBar.jsx";
import FiltersPage from "./pages/FiltersPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import ReleasesPage from "./pages/ReleasesPage.jsx";
import PromotionsPage from "./pages/PromotionsPage.jsx";
import CheapPage from "./pages/CheapPage.jsx";
import CollectionsPage from "./pages/CollectionsPage.jsx";
import CollectionPage from "./pages/CollectionPage.jsx";
import CollectionHero, {
  CollectionsHero,
} from "./components/CollectionHero.jsx";

import { useIsMobile } from "./hooks/useIsMobile";
import { normalizeProduct } from "./utils/normalizeProduct";
import { getReleases } from "./utils/getReleases";

import { supabaseClient } from "./lib/supabase.js";
import { getSeriesCatalog } from "./data/products/series.catalog.js";

import { useSeriesList } from "./hooks/useSeriesList";
import { useScrollTop } from "./hooks/useScrollTop";
import { getSelectedProduct } from "./utils/getSelectedProduct.js";

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
  // 🔹 Router hooks
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isModalNavigation = Boolean(location.state?.backgroundLocation);
  const { seriesSlug, volumeId } = useParams();
  const [sp, setSp] = useSearchParams();

  // 🔹 States principais (ANTES de usar em qualquer lugar)
  const [products, setProducts] = useState([]);
  const [seriesCatalog, setSeriesCatalog] = useState([]);

  // 🔹 Outros states
  const [releasesPage, setReleasesPage] = useState(1);
  const [page, setPage] = useState(1);
  const [seriesPage, setSeriesPage] = useState(1);

  const [inputValue, setInputValue] = useState("");
  const [activeSeries, setActiveSeries] = useState(null);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [activeSection, setActiveSection] = useState("colecoes");
  const [shouldScrollToVolumes, setShouldScrollToVolumes] = useState(false);

  // 🔹 Refs
  const lastAppliedQueryRef = useRef("");
  const collectionsSectionRef = useRef(null);

  // 🔹 Hooks custom
  const isMobile = useIsMobile();
  const { showScrollTop, scrollToTop } = useScrollTop(400);

  // 🔹 Derivados de dados (dependem de products / seriesCatalog)
  const { seriesList, seriesBySlug, seriesNames } = useSeriesList(
    products || [],
    seriesCatalog || [],
  );

  // 🔹 Meta por série
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

  // 🔹 Helper de meta
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

  // 🔹 Query params
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

  // 🔹 Releases
  const releases = useMemo(() => {
    return getReleases(products);
  }, [products]);

  // 🔹 Paginação lançamentos (isolada)
  const RELEASES_PAGE_SIZE = 20;

  const paginatedReleases = useMemo(() => {
    return releases.slice(
      (releasesPage - 1) * RELEASES_PAGE_SIZE,
      releasesPage * RELEASES_PAGE_SIZE,
    );
  }, [releases, releasesPage]);

  //🔹 Tipos de páginas
  const pageType = location.pathname.startsWith("/lancamentos")
    ? "releases"
    : location.pathname.startsWith("/promocoes")
      ? "promotions"
      : location.pathname.startsWith("/saldao")
        ? "cheap"
        : location.pathname === "/colecoes"
          ? "allCollections"
          : "home";

  const isRailPage = [
    "releases",
    "promotions",
    "cheap",
    "allCollections",
  ].includes(pageType);

  const isHomePage = pageType === "home";

  const isAllCollectionsPage = pageType === "allCollections";

  const isReleasesPage = pageType === "releases";

  const isPromotionsPage = pageType === "promotions";

  const isCheapPage = pageType === "cheap";

  const isCollectionPage = Boolean(seriesSlug && !volumeId);

  //🔹 Títulos de das páginas
  const PAGE_CONTENT = {
    home: {
      title: "Mangás Disponíveis",
      desc: "Veja os mangás disponíveis em estoque com preços atualizados e novas reposições.",
    },
    releases: {
      title: "Lançamentos 🔥",
      desc: "Confira os mangás adicionados recentemente e últimas reposições.",
    },
    promotions: {
      title: "Promoções 💸",
      desc: "Os melhores descontos do momento em mangás.",
    },
    cheap: {
      title: "Baratinhos 🪙",
      desc: "Mangás com os menores preços disponíveis.",
    },
    allCollections: {
      title: "Todas as Coleções",
      desc: "Explore todas as coleções de mangás disponíveis.",
    },
  };

  const pageContent = PAGE_CONTENT[pageType];

  const releasesTotalPages = Math.ceil(releases.length / RELEASES_PAGE_SIZE);

  // 🔹 Filtros
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

  //Loader inicial

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const { data, error } = await supabaseClient
        .from("series_volumes_view")
        .select("*");

      if (error) {
        console.error("Erro Supabase:", error);
        return;
      }

      if (!isMounted) return;

      setProducts((data || []).map(normalizeProduct));
      setIsInitialLoading(false);
    }

    getSeriesCatalog().then((catalog) => {
      if (isMounted) setSeriesCatalog(catalog);
    });

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isReleasesPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [releasesPage]);

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

  // 🔹 Paginação geral (home / filtros)
  const PRODUCTS_LOAD_SIZE = pageSize;

  const totalProductsPages = Math.ceil(filtered.length / PRODUCTS_LOAD_SIZE);

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

  const selectedProduct = getSelectedProduct(products, volumeId);

  const openSeries = (name) => {
    setPage(1);
    setShouldScrollToVolumes(true);

    const slug = slugify(name);
    const qs = sp.toString();
    navigate(`/${slug}${qs ? `?${qs}` : ""}`);
  };

  const clearSeries = () => {
    setPage(1);

    const pathname = location.pathname;

    const scrollTarget = pathname.startsWith("/lancamentos")
      ? "lancamentos"
      : pathname.startsWith("/promocoes")
        ? "promocoes"
        : pathname.startsWith("/saldao")
          ? "saldao"
          : "collectionsRail";

    navigate("/", {
      replace: true,
      state: {
        scrollTo: scrollTarget,
      },
    });
  };

  //Clique no produto para abrir o modal
  const openProduct = (product) => {
    if (!product?.seriesSlug || !product?.volumeSlug) {
      console.warn("🚨 Produto sem slug:", product);
      return;
    }

    navigate(`/${product.seriesSlug}/${product.volumeSlug}`, {
      state: { backgroundLocation: location },
    });
  };

  const closeModal = () => {
    const backgroundLocation = location.state?.backgroundLocation;

    if (backgroundLocation) {
      navigate(backgroundLocation, { replace: true });
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
      colecoes: ["collections", "obras", "collectionsSection"],
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

    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(targetId);

      if (el) {
        scrollToIdWithOffset(targetId);
        return;
      }

      attempts++;

      if (attempts < 20) {
        requestAnimationFrame(tryScroll);
      }
    };

    tryScroll();
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

  //Controle do header compacto e seção ativa no scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setIsHeaderCompact(y > 50);

      const sections = [
        { key: "lancamentos", ids: ["lancamentos"] },
        { key: "promocoes", ids: ["promotions"] },
        { key: "saldao", ids: ["deals"] },
        { key: "colecoes", ids: ["collections"] },
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

  if (isInitialLoading && !isModalNavigation) {
    return <Loader />;
  }

  // ========================================
  // PAGE HELPERS
  // ========================================

  const showHero = !isRailPage && !isCollectionPage;

  const showChapterHeader = !isRailPage && !isCollectionPage;

  const showCollectionsGrid = pageType === "collections" && !isFiltering;

  const showFilteringGrid = isFiltering && pageType !== "collection";

  const showRails = isHomePage && !isFiltering && !isCollectionPage;

  const showCollectionsPagination = pageType === "home" && totalSeriesPages > 1;

  const forceCompactHeader = pageType !== "home" || isCollectionPage;

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
        isHeaderCompact={isHeaderCompact || forceCompactHeader}
      />
      {showHero && (
        <>
          <HomeHero isHeaderCompact={isHeaderCompact} />

          <section className="brandBlock">
            <div className="brandHeader"></div>
            <BrandStats />
          </section>
        </>
      )}
      {showChapterHeader && (
        <section id="home" className="chapterBlock">
          <div className="chapterHeader">
            <div className="chapterTop">
              <h1 className="chapterTitle">{pageContent.title}</h1>
              <p className="chapterDesc">{pageContent.desc}</p>

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
        <CollectionPage
          activeSeries={activeSeries}
          filtered={filtered}
          pagedProducts={pagedProducts}
          pageSize={pageSize}
          hasMore={hasMore}
          setPage={setPage}
          openProduct={openProduct}
          clearSeries={clearSeries}
          collectionsSectionRef={collectionsSectionRef}
        />
      )}

      {pageType === "releases" && (
        <ReleasesPage products={products} onOpenProduct={openProduct} />
      )}
      {pageType === "promotions" && (
        <PromotionsPage products={products} onOpenProduct={openProduct} />
      )}
      {pageType === "cheap" && (
        <CheapPage products={products} onOpenProduct={openProduct} />
      )}
      {pageType === "allCollections" && (
        <CollectionsPage
          products={products}
          seriesCatalog={seriesCatalog}
          activeSeries={activeSeries}
          collectionsSectionRef={collectionsSectionRef}
          openSeries={openSeries}
          clearSeries={clearSeries}
          changeSeriesPage={changeSeriesPage}
        />
      )}

      {showRails && (
        <section className="railBlock">
          <div id="lancamentos">
            <LaunchRail
              id="lancamentos"
              title="Lançamentos 🔥"
              subtitle="Mangás adicionados recentemente e últimas reposições."
              titleClassName="sectionTitle"
              subtitleClassName="sectionSubtitle"
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
              subtitle="Mangás com 40% OFF ou mais."
              titleClassName="sectionTitle"
              subtitleClassName="sectionSubtitle"
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
              title="Saldão 🪙"
              subtitle="Mangás por até R$30."
              titleClassName="sectionTitle"
              subtitleClassName="sectionSubtitle"
              products={products}
              limit={40}
              onOpenProduct={openProduct}
            />
          </div>

          <div className="sectionBreak" aria-hidden="true">
            <span className="sectionBreakLine" />
          </div>

          <div id="collections">
            <CollectionsRail
              seriesList={seriesList}
              seriesToRender={seriesToRender}
              seriesPage={seriesPage}
              totalSeriesPages={totalSeriesPages}
              seriesPageDots={seriesPageDots}
              seriesPageSize={seriesPageSize}
              activeSeries={activeSeries}
              showCollectionsPagination={showCollectionsPagination}
              collectionsSectionRef={collectionsSectionRef}
              openSeries={openSeries}
              clearSeries={clearSeries}
              changeSeriesPage={changeSeriesPage}
            />
          </div>

          <div className="sectionBreak" aria-hidden="true">
            <span className="sectionBreakLine" />
          </div>
        </section>
      )}

      {selectedProduct && isModalNavigation && (
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
  const location = useLocation();
  const state = location.state;

  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/filtros" element={<FiltersPage />} />
        <Route path="/colecoes" element={<AppShell isAllCollectionsPage />} />
        <Route path="/lancamentos" element={<AppShell isReleasesPage />} />
        <Route path="/promocoes" element={<AppShell isPromotionsPage />} />
        <Route path="/saldao" element={<AppShell isCheapPage />} />
        <Route path="/" element={<AppShell />} />
        <Route path="/:seriesSlug" element={<AppShell />} />
        <Route path="/:seriesSlug/:volumeId" element={<AppShell />} />

        {/* 🔥 fallback (acesso direto) */}
        <Route path="/produto/:slug" element={<ProductPage />} />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/:seriesSlug/:volumeId" element={<AppShell />} />
        </Routes>
      )}
    </>
  );
}
