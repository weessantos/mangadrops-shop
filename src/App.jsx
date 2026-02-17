import { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import Header from "./components/Header";
import HomeHero from "./components/HomeHero";
import SeriesCard from "./components/SeriesCard";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import { products } from "./data/products";
import { seriesCatalog } from "./data/series";
import { aotAffiliate, opAffiliate, jjkAffiliate } from "./data/affiliates";

const ALIASES = {
  jjk: "jujutsu kaisen",
  aot: "attack on titan",
  snk: "shingeki no kyojin",
  op: "one piece",
};

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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

function formatMissing(missing, limit = 8) {
  if (!missing.length) return "Completo ✅";

  const shown = missing.slice(0, limit).join(", ");
  const rest = missing.length - Math.min(missing.length, limit);

  return rest > 0 ? `Sem estoque: ${shown} +${rest}` : `Sem estoque: ${shown}`;
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

    if (score > best.score) {
      best = { name, score };
    }
  }

  return best.score >= 1 ? best.name : null;
}

export default function App() {
  const PAGE_SIZE = 12;
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

  const seriesNames = useMemo(() => seriesList.map((s) => s.name), [seriesList]);

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
    setActiveSeries(picked);

    setTimeout(() => {
      document.getElementById("volumes")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }, [query, seriesNames]);

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

  const openSeries = (name) => {
    setPage(1);
    setSelected(null);

    setActiveSeries((prev) => {
      if (prev === name) return null;
      return name;
    });

    setQuery("");
    setInputValue("");
    lastAppliedQueryRef.current = "";

    setTimeout(() => {
      document.getElementById("volumes")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const clearSeries = () => {
    setPage(1);
    setActiveSeries(null);
    setQuery("");
    setSelected(null);
    setTimeout(() => {
      document.getElementById("obras")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
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

      <section id="obras" className="sectionHeader">
        <div className="sectionHeaderInner">
          <h2 className="sectionTitle">Obras 📚</h2>
          <p className="sectionSubtitle">
            Explore as coleções disponíveis e veja os volumes em estoque.
          </p>
        </div>
      </section>

      {!activeSeries && (
        <div className="sectionHint">
          Selecione uma obra abaixo para visualizar os volumes disponíveis.
        </div>
      )}

      {!activeSeries && (
        <section className="seriesGrid">
          {seriesList.map((s) => (
            <SeriesCard
              key={s.name}
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
          ))}
        </section>
      )}

      {activeSeries && (
        <div id="volumes" className="backRow">
          <button className="btn ghost backButton" onClick={clearSeries}>
            ← Voltar para obras
          </button>

          <div className="infoTag">
            Exibindo <strong>{activeSeries}</strong> • {pagedProducts.length}/{filtered.length} volume(s)
          </div>
        </div>
      )}

      {activeSeries && (
        <section className="volumesSection">
          <section className="grid">
            {pagedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={setSelected} />
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
        <ProductModal product={selected} onClose={() => setSelected(null)} />
      )}

      {/* ✅ Botão de subir para o topo */}
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
