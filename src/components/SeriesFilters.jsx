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
  const st = sp.get("st") || ""; // "in" | "out"
  const rv = sp.get("rv") || ""; // "1"
  const sort = sp.get("sort") || "relevance";

  const hasAny =
    q.trim() ||
    brand.length ||
    author.length ||
    genre.length ||
    format.length ||
    !!st ||
    rv === "1" ||
    (sort && sort !== "relevance");

  const openFilters = () => {
    // mantém a query atual ao abrir os filtros
    navigate(`/filtros${location.search}`);
  };

  const clearFilters = () => {
    const next = new URLSearchParams(sp);

    // limpa tudo que é filtro, mas mantém outras coisas se tiver
    next.delete("q");
    next.delete("sort");
    next.delete("st");
    next.delete("rv");
    next.delete("brand");
    next.delete("author");
    next.delete("genre");
    next.delete("format");

    setSp(next, { replace: true });
  };

  const activeCount =
    (q.trim() ? 1 : 0) +
    (brand.length ? 1 : 0) +
    (author.length ? 1 : 0) +
    (genre.length ? 1 : 0) +
    (format.length ? 1 : 0) +
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

  // resumo “compacto” pros chips
  const chips = uniq([
    q.trim() ? `Busca: ${q.trim()}` : null,
    brand.length ? `Editora: ${brand.length}` : null,
    author.length ? `Autor: ${author.length}` : null,
    genre.length ? `Gênero: ${genre.length}` : null,
    format.length ? `Tipo: ${format.length}` : null,
    stLabel ? stLabel : null,
    rv === "1" ? "Com review" : null,
    sortLabel ? `Ordenar: ${sortLabel}` : null,
  ].filter(Boolean));

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
  </div>
);
}