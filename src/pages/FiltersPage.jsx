import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/series-filters.css";

// ✅ seu catálogo (ajuste o path se seu arquivo estiver em outro lugar)
import { SERIES } from "../data/products/series.catalog";

/* =========================
   Helpers (robustos)
========================= */
const toList = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean);
  return [v].filter(Boolean);
};

const norm = (x) => String(x || "").trim();

const uniqSorted = (arr) =>
  Array.from(new Set(arr.map(norm).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

function buildOptionsFromSERIES(SERIES_OBJ) {
  const brands = [];
  const authors = [];
  const genres = [];
  const formats = [];

  for (const key of Object.keys(SERIES_OBJ || {})) {
    const s = SERIES_OBJ[key];
    if (!s) continue;

    toList(s.brand).forEach((x) => brands.push(x));
    toList(s.author).forEach((x) => authors.push(x));
    toList(s.genre).forEach((x) => genres.push(x));
    toList(s.format).forEach((x) => formats.push(x));
  }

  return {
    brands: uniqSorted(brands),
    authors: uniqSorted(authors),
    genres: uniqSorted(genres),
    formats: uniqSorted(formats),
  };
}

/* =========================
   Consts UI
========================= */
const STATUS = [
  { key: "in", label: "Em estoque" },
  { key: "out", label: "Sem estoque" },
];

const SORTS = [
  { key: "relevance", label: "Relevância" },
  { key: "new", label: "Novidades" },
];

const PRICE_OPTIONS = [
  { key: "20", label: "Até R$20" },
  { key: "30", label: "Até R$30" },
  { key: "40", label: "Até R$40" },
  { key: "50", label: "Até R$50" },
];

const DISCOUNT_OPTIONS = [
  { key: "20", label: "20% OFF+" },
  { key: "30", label: "30% OFF+" },
  { key: "40", label: "40% OFF+" },
  { key: "50", label: "50% OFF+" },
];

export default function FiltersPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  // ✅ Opções dinâmicas vindas do seriesCatalog
  const opts = useMemo(() => buildOptionsFromSERIES(SERIES), []);

  // Carrega o estado inicial do que já estava filtrado na URL
  const initial = useMemo(() => {
    return {
      q: sp.get("q") || "",

      brand: sp.getAll("brand"),
      author: sp.getAll("author"),
      genre: sp.getAll("genre"),
      format: sp.getAll("format"),

      price: sp.get("price") || "",      // "20" | "30" | "40" | "50" | ""
      discount: sp.get("discount") || "", // "20" | "30" | "40" | "50" | ""

      st: sp.get("st") || "", // "in" | "out" | ""
      rv: sp.get("rv") || "", // "1" | ""
      sort: sp.get("sort") || "relevance",
    };
  }, [sp]);

  const [q, setQ] = useState(initial.q);

  const [brand, setBrand] = useState(initial.brand);
  const [author, setAuthor] = useState(initial.author);
  const [genre, setGenre] = useState(initial.genre);
  const [format, setFormat] = useState(initial.format);

  const [price, setPrice] = useState(initial.price);
  const [discount, setDiscount] = useState(initial.discount);

  const [st, setSt] = useState(initial.st);
  const [rv, setRv] = useState(initial.rv);
  const [sort, setSort] = useState(initial.sort);

  // Trava o scroll do body enquanto a tela de filtros está aberta
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  const toggleMulti = (setter) => (value) => {
    const v = norm(value);
    setter((curr) => (curr.includes(v) ? curr.filter((x) => x !== v) : [...curr, v]));
  };

  const clearAll = () => {
    setQ("");
    setBrand([]);
    setAuthor([]);
    setGenre([]);
    setFormat([]);
    setPrice("");
    setDiscount("");
    setSt("");
    setRv("");
    setSort("relevance");
  };

  const apply = () => {
    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());

    brand.forEach((x) => params.append("brand", x));
    author.forEach((x) => params.append("author", x));
    genre.forEach((x) => params.append("genre", x));
    format.forEach((x) => params.append("format", x));

    if (price) params.set("price", price);
    if (discount) params.set("discount", discount);
    if (st) params.set("st", st);
    if (rv) params.set("rv", "1");
    if (sort && sort !== "relevance") params.set("sort", sort);

    navigate({ pathname: "/", search: params.toString() }, { replace: true });
  };

  const close = () => navigate(-1);

  const activeCount =
    (q.trim() ? 1 : 0) +
    (brand.length ? 1 : 0) +
    (author.length ? 1 : 0) +
    (genre.length ? 1 : 0) +
    (format.length ? 1 : 0) +
    (price ? 1 : 0) +
    (discount ? 1 : 0) +
    (st ? 1 : 0) +
    (rv === "1" ? 1 : 0) +
    (sort !== "relevance" ? 1 : 0);

  return (
    <div className="filtersPage" role="dialog" aria-modal="true" aria-label="Filtros">
      <header className="filtersTop">
        <button className="filtersIconBtn" onClick={close} aria-label="Voltar">
          ←
        </button>

        <div className="filtersTopTitle">
          <h1>Filtros</h1>
          <p>{activeCount ? `${activeCount} ativo(s)` : "Refine sua busca"}</p>
        </div>

        <button className="filtersGhost" onClick={clearAll}>
          Limpar
        </button>
      </header>

      <main className="filtersBody">
        {/* Busca */}
        <section className="filtersCard">
          <h2>Buscar</h2>
          <div className="filtersSearchRow">
            <input
              className="filtersInput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex: Attack on Titan, Jujutsu..."
              inputMode="search"
            />
          </div>
        </section>

        {/* Editora (brand) */}
        <section className="filtersCard">
          <h2>Editora</h2>
          <div className="filtersChips">
            {opts.brands.map((b) => (
              <button
                key={b}
                type="button"
                className={`chip ${brand.includes(b) ? "active" : ""}`}
                onClick={() => toggleMulti(setBrand)(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </section>

        {/* Autor (author) */}
        <section className="filtersCard">
          <h2>Autor</h2>
          <div className="filtersChips">
            {opts.authors.map((a) => (
              <button
                key={a}
                type="button"
                className={`chip ${author.includes(a) ? "active" : ""}`}
                onClick={() => toggleMulti(setAuthor)(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </section>

        {/* Gênero (genre) */}
        <section className="filtersCard">
          <h2>Gênero</h2>
          <div className="filtersChips">
            {opts.genres.map((g) => (
              <button
                key={g}
                type="button"
                className={`chip ${genre.includes(g) ? "active" : ""}`}
                onClick={() => toggleMulti(setGenre)(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* Tipo (format) */}
        <section className="filtersCard">
          <h2>Tipo</h2>
          <div className="filtersChips">
            {opts.formats.map((f) => (
              <button
                key={f}
                type="button"
                className={`chip ${format.includes(f) ? "active" : ""}`}
                onClick={() => toggleMulti(setFormat)(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </section>

        {/* Preço */}
        <section className="filtersCard">
          <h2>Preço</h2>
          <div className="filtersGrid2">
            {PRICE_OPTIONS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`chip ${price === p.key ? "active" : ""}`}
                onClick={() => setPrice((curr) => (curr === p.key ? "" : p.key))}
              >
                {p.label}
              </button>
            ))}
          </div>
        </section>

        {/* Desconto */}
        <section className="filtersCard">
          <h2>Desconto</h2>
          <div className="filtersGrid2">
            {DISCOUNT_OPTIONS.map((d) => (
              <button
                key={d.key}
                type="button"
                className={`chip ${discount === d.key ? "active" : ""}`}
                onClick={() => setDiscount((curr) => (curr === d.key ? "" : d.key))}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* Disponibilidade */}
        <section className="filtersCard">
          <h2>Disponibilidade</h2>
          <div className="filtersGrid2">
            {STATUS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`chip ${st === s.key ? "active" : ""}`}
                onClick={() => setSt((curr) => (curr === s.key ? "" : s.key))}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* Review */}
        <section className="filtersCard">
          <h2>Conteúdo</h2>
          <div className="filtersGrid2">
            <button
              type="button"
              className={`chip ${rv === "1" ? "active" : ""}`}
              onClick={() => setRv((curr) => (curr === "1" ? "" : "1"))}
            >
              Com review
            </button>
          </div>
        </section>

        {/* Ordenar */}
        <section className="filtersCard">
          <h2>Ordenar</h2>
          <div className="filtersList">
            {SORTS.map((o) => (
              <button
                key={o.key}
                type="button"
                className={`filtersRow ${sort === o.key ? "active" : ""}`}
                onClick={() => setSort(o.key)}
              >
                <span>{o.label}</span>
                <span className="filtersRadio" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="filtersBottom">
        <button className="btnPrimary" onClick={apply}>
          Aplicar filtros
        </button>
      </footer>
    </div>
  );
}