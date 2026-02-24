import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import "./styles/global.css";
import Header from "./components/Header";
import HomeHero from "./components/HomeHero";
import SeriesCard from "./components/SeriesCard";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import { products } from "./data/products";
import { seriesCatalog } from "./data/series";
import LaunchRail from "./components/LaunchRail";
import BrandStats from "./components/BrandStats";

const ALIASES = {
  jjk: "jujutsu kaisen",
  aot: "attack on titan",
  snk: "shingeki no kyojin",
  op: "one piece",
  kgb: "kagurabachi",
  vinland: "vinland saga",
  haikyu: "haikyu",
};

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function expandAliases(tokens) {
  const out = [];
  for (const t of tokens) {
    const repl = ALIASES[t];
    if (repl) out.push(...repl.split(" "));
    else out.push(t);
  }
  return out;
}

function parseQuery(q) {
  const norm = normalizeText(q);
  let tokens = norm.split(/\s+/).filter(Boolean);
  tokens = expandAliases(tokens);

  const numbers = tokens
    .map((t) => (/^\d+$/.test(t) ? Number(t) : null))
    .filter((n) => Number.isFinite(n));

  const words = tokens.filter((t) => !/^\d+$/.test(t));

  return { tokens, words, numbers };
}

function productSearchText(p) {
  return normalizeText(
    `${p.title} ${p.tag ?? ""} ${p.series ?? ""} vol ${p.volume ?? ""}`
  );
}

function uniqueSortedAvailableVolumes(items) {
  const set = new Set();

  for (const p of items) {
    const v = Number(p.volume);

    const isAvailable =
      (p.affiliate?.mercadoLivre && p.affiliate.mercadoLivre.trim() !== "") ||
      (p.affiliate?.amazon && p.affiliate.amazon.trim() !== "");

    if (Number.isFinite(v) && v > 0 && isAvailable) {
      set.add(v);
    }
  }

  return Array.from(set).sort((a, b) => a - b);
}

function computeMissing(vols, total) {
  const have = new Set(vols);
  const missing = [];
  for (let v = 1; v <= total; v++) {
    if (!have.has(v)) missing.push(v);
  }
  return missing;
}

function pickSeriesFromQuery(query, seriesNames) {
  const { words } = parseQuery(query);
  if (!words.length) return null;

  let best = { name: null, score: 0 };

  for (const name of seriesNames) {
    const n = normalizeText(name);
    let score = 0;

    for (const w of words) {
      if (n.includes(w) || n.split(" ").some((tok) => tok.startsWith(w))) {
        score++;
      }
    }

    if (score > best.score) best = { name, score };
  }

  return best.score >= 1 ? best.name : null;
}

/* =======================================================
   SECTION HEADER (padrão único para qualquer seção)
   - title: título da seção
   - subtitle: texto menor abaixo do título (opcional)
   - meta: tag à direita (opcional)
======================================================= */
function SectionHeader({ title, subtitle, meta }) {
  return (
    <div className="sectionHeader">
      <div className="sectionHeaderLeft">
        <h2 className="sectionTitle">
          <span className="sectionAccent" aria-hidden="true" />
          {title}
        </h2>
        {subtitle ? <p className="sectionSubtitle">{subtitle}</p> : null}
      </div>

      <div className="sectionHeaderRight">
        {meta ? <span className="sectionMeta">{meta}</span> : null}
      </div>
    </div>
  );
}

/* =======================================================
   APP "REAL" (o seu layout), agora lendo a rota
======================================================= */
function AppShell() {
  const PAGE_SIZE = 12;
  const navigate = useNavigate();
  const { seriesSlug, volumeId } = useParams();

  const [page, setPage] = useState(1);
  const lastAppliedQueryRef = useRef("");
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeSeries, setActiveSeries] = useState(null);

  // ✅ Botão de subir pro topo
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const catalogMap = useMemo(() => {
    const map = new Map();
    for (const s of seriesCatalog) map.set(s.name, s);
    return map;
  }, []);

  const seriesList = useMemo(() => {
    const groups = new Map();

    for (const p of products) {
      const key = p.series || "Outros";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(p);
    }

    return Array.from(groups.entries())
      .map(([name, items]) => {
        const cat = catalogMap.get(name) || {};
        const total = Number.isFinite(Number(cat.totalVolumes))
          ? Number(cat.totalVolumes)
          : null;

        const vols = uniqueSortedAvailableVolumes(items);
        const haveCount = vols.length;

        const rangeLabel = total ? `Vol. 1–${total}` : "Volumes";
        const haveLabel = total
          ? `Disponível ${haveCount}/${total}`
          : `${haveCount} volume(s)`;

        const missing = total ? computeMissing(vols, total) : [];
        const missingCount = missing.length;

        const statusLabel = total
          ? missingCount === 0
            ? "Completo ✅"
            : `Sem estoque (${missingCount})`
          : "Defina totalVolumes";

        return {
          name,
          slug: slugify(name),
          thumb: cat.thumb || "/assets/aot-series.jpeg",
          subtitle: cat.subtitle || "Clique para ver os volumes disponíveis.",
          rangeLabel,
          haveLabel,
          statusLabel,
          missing,
          missingCount,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [catalogMap]);

  const seriesBySlug = useMemo(() => {
    const map = new Map();
    for (const s of seriesList) map.set(s.slug, s.name);
    return map;
  }, [seriesList]);

  const seriesNames = useMemo(() => seriesList.map((s) => s.name), [seriesList]);

  // ✅ Sync: rota -> activeSeries
  useEffect(() => {
    if (!seriesSlug) {
      setActiveSeries(null);
      setSelected(null);
      return;
    }
    const name = seriesBySlug.get(seriesSlug) || null;
    setActiveSeries(name);
  }, [seriesSlug, seriesBySlug]);

  // seu search que “pula” pra série
  useEffect(() => {
    const q = query.trim();
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

    // ✅ em vez de setar state, navega pra URL da série
    navigate(`/${slugify(picked)}`);

    setTimeout(() => {
      document.getElementById("volumes")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }, [query, seriesNames, navigate]);

  const filtered = useMemo(() => {
    const { words, numbers } = parseQuery(query);

    return products
      .filter((p) =>
        activeSeries ? (p.series || "Outros") === activeSeries : true
      )
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
      })
      .sort((a, b) => Number(a.volume ?? 0) - Number(b.volume ?? 0));
  }, [query, activeSeries]);

  const pagedProducts = useMemo(() => {
    return filtered.slice(0, page * PAGE_SIZE);
  }, [filtered, page]);

  const hasMore = pagedProducts.length < filtered.length;

  // ✅ Sync: rota -> modal aberto
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
    setQuery("");
    setInputValue("");
    lastAppliedQueryRef.current = "";

    const slug = slugify(name);

    // ✅ troca a URL pra rota da série
    navigate(`/${slug}`);

    setTimeout(() => {
      document.getElementById("volumes")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };


  const clearSeries = () => {
    setPage(1);
    setQuery("");
    setSelected(null);

    // ✅ volta pra home e troca histórico (melhora botão voltar)
    navigate(`/`, { replace: true });

    setTimeout(() => {
      document.getElementById("obras")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const openProduct = (product) => {
    setSelected(product);

    // 1) Descobre o slug da série de forma segura
    const seriesName = product?.series || activeSeries; // preferir a série do produto
    const parentSlug = seriesSlug || (seriesName ? slugify(seriesName) : null);

    // 2) Se tiver série, usa /serie/produto
    if (parentSlug) {
      navigate(`/${parentSlug}/${product.id}`);
      return;
    }

    // 3) Fallback: se por algum motivo não tiver série, pelo menos abre /produto
    navigate(`/${product.id}`);
  };

  const closeModal = () => {
    setSelected(null);

    // Volta pra rota pai correta (ou home)
    if (seriesSlug) {
      navigate(`/${seriesSlug}`, { replace: true });
      return;
    }

    if (activeSeries) {
      navigate(`/${slugify(activeSeries)}`, { replace: true });
      return;
    }

    navigate(`/`, { replace: true }); // ✅ sempre limpa a URL
  };

  return (
    <div className="container">
      <Header
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSearch={(override) => {
          const q = typeof override === "string" ? override : inputValue;
          setQuery(q);
          setPage(1);
        }}
      />

      <HomeHero />

      <section className="brandBlock">
        <div className="brandHeader">
          <h2 className="brandTitle">
            Mangá Drops no TikTok
          </h2>
          <p className="brandSubtitle">
            Reviews, indicações e novidades toda semana.
          </p>
        </div>

        <BrandStats />
      </section>

      <section id="home" className="chapterBlock">
        <div className="chapterHeader">
          <div className="chapterTop">
            <h1 className="chapterTitle">
              Mangás Disponíveis
            </h1>
          </div>

          <p className="chapterDesc">
            {!activeSeries
              ? "Confira os volumes em estoque e garanta o seu antes que esgote. Atualizado com lançamentos e reposições recentes."
              : "Adquira seu mangá preferido com os melhores preços do mercado. Links atualizados."
            }
          </p>

          <div className="chapterLine" aria-hidden="true" />
        </div>
      </section>

      {!activeSeries && (
        <section className="railBlock" id="obras">
          <LaunchRail
            title="Lançamentos"
            products={products}
            limit={30}
            onOpenProduct={openProduct}
          />

          {/* ✅ Quebra visual + respiro */}
          <div className="sectionBreak" aria-hidden="true">
            <span className="sectionBreakLine" />
          </div>

          {/* ✅ Coleções em "faixa" separada */}
          <section className="collectionsSection" id="railTitle">
            <SectionHeader
              title="Coleções"
              subtitle="Explore por obra e veja os volumes disponíveis."
            />

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
            <span>• {pagedProducts.length}/{filtered.length} volume(s)</span>
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
              <button
                className="btn showMoreBtn"
                onClick={() => setPage((prev) => prev + 1)}
              >
                Mostrar mais {PAGE_SIZE}
              </button>
              <div className="showMoreHint">
                Exibindo {pagedProducts.length}/{filtered.length}
              </div>
            </div>
          )}
        </section>
      )}

      {selected && (
        <ProductModal product={selected} onClose={closeModal} />
      )}

      {showScrollTop && (
        <button
          className="scrollTopBtn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
          title="Voltar ao topo"
        >
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
      <Route path="/" element={<AppShell />} />
      <Route path="/:seriesSlug" element={<AppShell />} />
      <Route path="/:seriesSlug/:volumeId" element={<AppShell />} />
    </Routes>
  );
}