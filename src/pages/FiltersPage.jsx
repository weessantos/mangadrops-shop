import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBestPrice } from "../utils/priceLoader";
import "../styles/series-filters.css";

/* =========================
   Helpers
========================= */
const norm = (x) => String(x || "").trim();

const uniq = (arr) =>
  Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

function buildOptions(seriesArray) {
  const brands = [];
  const authors = [];
  const genres = [];
  const formats = [];

  for (const s of seriesArray) {
    if (!s) continue;

    if (s.brand) brands.push(s.brand);
    if (s.author) authors.push(s.author);
    if (s.format) formats.push(s.format);

    if (s.genre) {
      s.genre.split("/").forEach((g) => genres.push(g.trim()));
    }
  }

  return {
    brands: uniq(brands),
    authors: uniq(authors),
    genres: uniq(genres),
    formats: uniq(formats),
  };
}

function getPriceValue(v) {
  const best = getBestPrice(v.id);
  return best?.value ?? null;
}

/* =========================
   Consts UI
========================= */
const PRICE_OPTIONS = ["20", "30", "40", "50"];
const DISCOUNT_OPTIONS = ["20", "30", "40", "50"];

export default function FiltersPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [seriesData, setSeriesData] = useState([]);
  const [opts, setOpts] = useState({
    brands: [],
    authors: [],
    genres: [],
    formats: [],
  });

  const [loading, setLoading] = useState(true);

  // ========================
  // FETCH API
  // ========================
  useEffect(() => {
    async function load() {
      const res = await fetch("http://localhost:3000/api/series/full");
      const data = await res.json();

      setSeriesData(data);
      setOpts(buildOptions(data));
      setLoading(false);
    }

    load();
  }, []);

  // ========================
  // STATES
  // ========================
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState([]);
  const [author, setAuthor] = useState([]);
  const [genre, setGenre] = useState([]);
  const [format, setFormat] = useState([]);
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");

  // ========================
  // FLATTEN
  // ========================
  const volumes = useMemo(() => {
    return seriesData.flatMap((s) =>
      (s.volumes || []).map((v) => ({
        ...s,
        ...v,
      }))
    );
  }, [seriesData]);

  console.log(
    volumes.filter(v => v.best_price <= 30)
  );
  // ========================
  // FILTER
  // ========================
  const filtered = useMemo(() => {
  return volumes.filter((v) => {
    // 🔎 busca
    if (q && !v.title?.toLowerCase().includes(q.toLowerCase()))
      return false;

    // 🏷 brand
    if (brand.length && !brand.includes(v.brand)) return false;

    // ✍️ author
    if (author.length && !author.includes(v.author)) return false;

    // 🎭 genre
    if (
      genre.length &&
      !genre.some((g) =>
        v.genre?.toLowerCase().includes(g.toLowerCase())
      )
    )
      return false;

    // 📦 format
    if (format.length && !format.includes(v.format)) return false;

    // 💰 preço
    if (price) {
      if (v.best_price == null) return false;
      if (v.best_price > Number(price)) return false;
    }

    // 🔥 desconto
    if (discount) {
      if (v.discount == null) return false;
      if (v.discount < Number(discount)) return false;
    }

    return true;
  });
}, [volumes, q, brand, author, genre, format, price, discount]);
console.log("FILTERED:", filtered.length);
console.log("ORIGINAL:", volumes.length);
  // ========================
  // ACTIONS
  // ========================
  const toggle = (setter, value) => {
    setter((curr) =>
      curr.includes(value)
        ? curr.filter((x) => x !== value)
        : [...curr, value]
    );
  };

  const clearAll = () => {
    setQ("");
    setBrand([]);
    setAuthor([]);
    setGenre([]);
    setFormat([]);
    setPrice("");
    setDiscount("");
  };

  const apply = () => {
    const params = new URLSearchParams();

    if (q) params.set("q", q);

    brand.forEach((b) => params.append("brand", b));
    author.forEach((a) => params.append("author", a));
    genre.forEach((g) => params.append("genre", g));
    format.forEach((f) => params.append("format", f));

    if (price) params.set("price", price);
    if (discount) params.set("discount", discount);

    // 🔥 mantém a rota atual
    navigate({
      pathname: "/",
      search: `?${params.toString()}`
    });
  };

  const close = () => navigate(-1);

  // ========================
  // LOADING
  // ========================
  if (loading) {
    return <div style={{ padding: 24 }}>Carregando...</div>;
  }

  // ========================
  // UI
  // ========================
  return (
    <div className="filtersPage">
      <header className="filtersTop">
        <button onClick={close}>←</button>
        <h1>Filtros</h1>
        <button onClick={clearAll}>Limpar</button>
      </header>

      <main className="filtersBody">
        {/* Busca */}
        <div className="filtersCard">
          <h2>Busca</h2>

          <div className="filtersSearchRow">
            <input
              className="filtersInput"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar..."
            />
          </div>
        </div>

        {/* Brand */}
        <div className="filtersCard">
          <h2>Editora</h2>

          <div className="filtersChips">
            {opts.brands.map((b) => (
              <button
                key={b}
                className={`chip ${brand.includes(b) ? "active" : ""}`}
                onClick={() => toggle(setBrand, b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Author */}
        <div className="filtersCard">
          <h2>Autor</h2>

          <div className="filtersChips">
            {opts.authors.map((a) => (
              <button
                key={a}
                className={`chip ${author.includes(a) ? "active" : ""}`}
                onClick={() => toggle(setAuthor, a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Genre */}
        <div className="filtersCard">
          <h2>Gênero</h2>

          <div className="filtersChips">
            {opts.genres.map((g) => (
              <button
                key={g}
                className={`chip ${genre.includes(g) ? "active" : ""}`}
                onClick={() => toggle(setGenre, g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="filtersCard">
          <h2>Formato</h2>

          <div className="filtersChips">
            {opts.formats.map((f) => (
              <button
                key={f}
                className={`chip ${format.includes(f) ? "active" : ""}`}
                onClick={() => toggle(setFormat, f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Price and Discount */}
        <div className="filtersCard">
          <h2>Preço</h2>

          <div className="filtersGrid2">
            {PRICE_OPTIONS.map((p) => (
              <button
                key={p}
                className={`chip ${price === p ? "active" : ""}`}
                onClick={() => setPrice(p)}
              >
                Até R${p}
              </button>
            ))}
          </div>
        </div>

        <div className="filtersCard">
          <h2>Desconto</h2>

          <div className="filtersGrid2">
            {DISCOUNT_OPTIONS.map((d) => (
              <button
                key={d}
                className={`chip ${discount === d ? "active" : ""}`}
                onClick={() => setDiscount(d)}
              >
                {d}% OFF
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="filtersBottom">
        <button className="btnPrimary" onClick={apply}>
          Aplicar filtros
        </button>
      </footer>
    </div>
  );
}