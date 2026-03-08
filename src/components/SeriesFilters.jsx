import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function uniq(arr) {
  return Array.from(new Set(arr));
}

export default function SeriesFilters() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sp, setSp] = useSearchParams();

  const q = sp.get("q") || "";
  const brand = sp.getAll("brand");
  const author = sp.getAll("author");
  const genre = sp.getAll("genre");
  const format = sp.getAll("format");

  const price = sp.get("price") || "";
  const discount = sp.get("discount") || "";

  const st = sp.get("st") || ""; // "in" | "out"
  const rv = sp.get("rv") || ""; // "1"
  const sort = sp.get("sort") || "relevance";

  const hasAny =
    q.trim() ||
    brand.length ||
    author.length ||
    genre.length ||
    format.length ||
    price ||
    discount ||
    !!st ||
    rv === "1" ||
    (sort && sort !== "relevance");

  const openFilters = () => {
    navigate(`/filtros${location.search}`);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(sp);

    next.delete("q");
    next.delete("sort");
    next.delete("st");
    next.delete("rv");
    next.delete("brand");
    next.delete("author");
    next.delete("genre");
    next.delete("format");
    next.delete("price");
    next.delete("discount");

    setSp(next, { replace: true });
  };

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

  const stLabel = st === "in" ? "Em estoque" : st === "out" ? "Sem estoque" : "";

  const sortLabel =
    sort === "new"
      ? "Novidades"
      : sort === "price_asc"
      ? "Menor preço"
      : sort === "price_desc"
      ? "Maior preço"
      : "";

  const priceLabel =
    price === "20"
      ? "Até R$20"
      : price === "30"
      ? "Até R$30"
      : price === "40"
      ? "Até R$40"
      : price === "50"
      ? "Até R$50"
      : "";

  const discountLabel =
    discount === "20"
      ? "20% OFF+"
      : discount === "30"
      ? "30% OFF+"
      : discount === "40"
      ? "40% OFF+"
      : discount === "50"
      ? "50% OFF+"
      : "";

  const chips = uniq(
    [
      q.trim() ? `Busca: ${q.trim()}` : null,
      brand.length ? `Editora: ${brand.length}` : null,
      author.length ? `Autor: ${author.length}` : null,
      genre.length ? `Gênero: ${genre.length}` : null,
      format.length ? `Tipo: ${format.length}` : null,
      priceLabel,
      discountLabel,
      stLabel,
      rv === "1" ? "Com review" : null,
      sortLabel ? `Ordenar: ${sortLabel}` : null,
    ].filter(Boolean)
  );

  return (
    <div className="filtersPanel" role="region" aria-label="Filtros">
      <div className="filtersTop">
        <div className="filtersHeading">
          Filtros {hasAny ? <span className="filtersCount">• {activeCount}</span> : null}
        </div>

        <div className="filtersActions">
          {hasAny && (
            <button type="button" className="chip ghost" onClick={clearFilters}>
              Limpar
            </button>
          )}

          <button type="button" className="chip active" onClick={openFilters}>
            Abrir filtros
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="filtersChipsActive">
          {chips.map((c) => (
            <span key={c} className="chip small">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}