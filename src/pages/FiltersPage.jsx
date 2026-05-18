// ============================================================================
// FiltersPage.jsx
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Tela responsável por selecionar filtros do catálogo.
//
// Faz:
//
// ✅ Carrega dados do Supabase
// ✅ Gera opções dinâmicas
// ✅ Sincroniza estados com URL
// ✅ Aplica filtros na URL
// ✅ Limpa filtros
//
// Não faz:
//
// ❌ Busca produtos
// ❌ Renderiza catálogo
// ❌ Aplica lógica de busca
// ❌ Faz paginação
//
// Fluxo:
//
// Supabase
// ↓
// buildOptions()
// ↓
// estados locais
// ↓
// URLSearchParams
// ↓
// App/SearchPage
//
// ============================================================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import "../styles/filters-page.css";
import { supabaseClient } from "../lib/supabase";

/* ============================================================================
   HELPERS
============================================================================ */

const uniq = (arr) =>
  Array.from(new Set(arr.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
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

/* ============================================================================
   CONSTS
============================================================================ */

const PRICE_OPTIONS = ["20", "30", "40", "50"];

const DISCOUNT_OPTIONS = ["20", "30", "40", "50"];

export default function FiltersPage() {
  const navigate = useNavigate();

  const [sp] = useSearchParams();
  const location = useLocation();

  /* ==========================================================================
     API
  ========================================================================== */

  const [loading, setLoading] = useState(true);

  const [seriesData, setSeriesData] = useState([]);

  const [opts, setOpts] = useState({
    brands: [],
    authors: [],
    genres: [],
    formats: [],
  });

  useEffect(() => {
    async function load() {
      const { data, error } = await supabaseClient
        .from("series_volumes_view")
        .select("*");

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setSeriesData(data);

      setOpts(buildOptions(data));

      setLoading(false);
    }

    load();
  }, []);

  /* ==========================================================================
     FILTER STATES
  ========================================================================== */

  const [q, setQ] = useState("");

  const [brand, setBrand] = useState([]);

  const [author, setAuthor] = useState([]);

  const [genre, setGenre] = useState([]);

  const [format, setFormat] = useState([]);

  const [price, setPrice] = useState("");

  const [discount, setDiscount] = useState("");

  /* ==========================================================================
     RESTORE STATE FROM URL
  ========================================================================== */

  useEffect(() => {
    setQ(sp.get("q") || "");

    setBrand(sp.getAll("brand"));

    setAuthor(sp.getAll("author"));

    setGenre(sp.getAll("genre"));

    setFormat(sp.getAll("format"));

    setPrice(sp.get("price") || "");

    setDiscount(sp.get("discount") || "");
  }, [sp]);

  /* ==========================================================================
     COMPUTED
  ========================================================================== */

  const activeFiltersCount = useMemo(() => {
    return (
      brand.length +
      author.length +
      genre.length +
      format.length +
      (q ? 1 : 0) +
      (price ? 1 : 0) +
      (discount ? 1 : 0)
    );
  }, [q, brand, author, genre, format, price, discount]);

  /* ==========================================================================
     ACTIONS
  ========================================================================== */

  const toggle = (setter, value) => {
    setter((curr) =>
      curr.includes(value) ? curr.filter((x) => x !== value) : [...curr, value],
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

    if (price) {
      params.set("price", price);
    }

    if (discount) {
      params.set("discount", discount);
    }

    // 🔥 manda para página de busca
    navigate({
      pathname: "/busca",
      search: `?${params.toString()}`,
    });
  };

  const close = () => navigate(-1);

  /* ==========================================================================
     LOADING
  ========================================================================== */

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
        }}
      >
        Carregando...
      </div>
    );
  }

  /* ==========================================================================
     UI
  ========================================================================== */

  return (
    <div className="filtersPage">
      <header className="filtersTop">
        <button onClick={close}>←</button>

        <h1>Filtros ({activeFiltersCount})</h1>

        <button onClick={clearAll}>Limpar</button>
      </header>

      <main className="filtersBody">
        {/* Busca */}
        <FilterSearch q={q} setQ={setQ} />

        {/* Editora */}
        <FilterChips
          title="Editora"
          options={opts.brands}
          values={brand}
          toggle={(v) => toggle(setBrand, v)}
        />

        {/* Autor */}
        <FilterChips
          title="Autor"
          options={opts.authors}
          values={author}
          toggle={(v) => toggle(setAuthor, v)}
        />

        {/* Gênero */}
        <FilterChips
          title="Gênero"
          options={opts.genres}
          values={genre}
          toggle={(v) => toggle(setGenre, v)}
        />

        {/* Formato */}
        <FilterChips
          title="Formato"
          options={opts.formats}
          values={format}
          toggle={(v) => toggle(setFormat, v)}
        />

        {/* Preço */}
        <FilterChips
          title="Preço"
          options={PRICE_OPTIONS.map((v) => `Até R$${v}`)}
          values={price ? [`Até R$${price}`] : []}
          toggle={(v) => setPrice(v.replace("Até R$", ""))}
          single
        />

        {/* Desconto */}
        <FilterChips
          title="Desconto"
          options={DISCOUNT_OPTIONS.map((v) => `${v}% OFF`)}
          values={discount ? [`${discount}% OFF`] : []}
          toggle={(v) => setDiscount(v.replace("% OFF", ""))}
          single
        />
      </main>

      <footer className="filtersBottom">
        <button className="btnPrimary" onClick={apply}>
          Aplicar filtros
        </button>
      </footer>
    </div>
  );
}

/* ============================================================================
   SUB COMPONENTS
============================================================================ */

function FilterSearch({ q, setQ }) {
  return (
    <div className="filtersCard">
      <h2>Busca</h2>

      <input
        className="filtersInput"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar..."
      />
    </div>
  );
}

function FilterChips({ title, options, values, toggle, single = false }) {
  return (
    <div className="filtersCard">
      <h2>{title}</h2>

      <div className="filtersChips">
        {options.map((item) => {
          const active = values.includes(item);

          return (
            <button
              key={item}
              className={`chip ${active ? "active" : ""}`}
              onClick={() => {
                if (single && active) {
                  toggle("");
                  return;
                }

                toggle(item);
              }}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
