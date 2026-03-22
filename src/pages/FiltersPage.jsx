import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  // ========================
  // FILTER
  // ========================
  const filtered = useMemo(() => {
    return volumes.filter((v) => {
      if (q && !v.title.toLowerCase().includes(q.toLowerCase())) return false;

      if (brand.length && !brand.includes(v.brand)) return false;

      if (author.length && !author.includes(v.author)) return false;

      if (
        genre.length &&
        !genre.some((g) => v.genre?.includes(g))
      )
        return false;

      if (format.length && !format.includes(v.format)) return false;

      if (price && (!v.best_price || v.best_price > Number(price))) return false;

      if (discount && (!v.discount || v.discount < Number(discount))) return false;

      return true;
    });
  }, [volumes, q, brand, author, genre, format, price, discount]);

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

    navigate(`/?${params.toString()}`);
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
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar..."
        />

        {/* Brand */}
        {opts.brands.map((b) => (
          <button
            key={b}
            className={brand.includes(b) ? "active" : ""}
            onClick={() => toggle(setBrand, b)}
          >
            {b}
          </button>
        ))}

        {/* Author */}
        {opts.authors.map((a) => (
          <button
            key={a}
            className={author.includes(a) ? "active" : ""}
            onClick={() => toggle(setAuthor, a)}
          >
            {a}
          </button>
        ))}

        {/* Genre */}
        {opts.genres.map((g) => (
          <button
            key={g}
            className={genre.includes(g) ? "active" : ""}
            onClick={() => toggle(setGenre, g)}
          >
            {g}
          </button>
        ))}

        {/* Format */}
        {opts.formats.map((f) => (
          <button
            key={f}
            className={format.includes(f) ? "active" : ""}
            onClick={() => toggle(setFormat, f)}
          >
            {f}
          </button>
        ))}

        {/* Price */}
        {PRICE_OPTIONS.map((p) => (
          <button
            key={p}
            className={price === p ? "active" : ""}
            onClick={() => setPrice(p)}
          >
            Até R${p}
          </button>
        ))}

        {/* Discount */}
        {DISCOUNT_OPTIONS.map((d) => (
          <button
            key={d}
            className={discount === d ? "active" : ""}
            onClick={() => setDiscount(d)}
          >
            {d}% OFF
          </button>
        ))}
      </main>

      <footer>
        <button onClick={apply}>Aplicar filtros</button>
      </footer>
    </div>
  );
}