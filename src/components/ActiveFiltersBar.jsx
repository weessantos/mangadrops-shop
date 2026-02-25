import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function countActive(sp) {
  const q = (sp.get("q") || "").trim();
  const sort = sp.get("sort") || "relevance";
  const st = sp.get("st") || "";
  const rv = sp.get("rv") || "";

  const brand = sp.getAll("brand");
  const author = sp.getAll("author");
  const genre = sp.getAll("genre");
  const format = sp.getAll("format");

  let n =
    (q ? 1 : 0) +
    (brand.length ? 1 : 0) +
    (author.length ? 1 : 0) +
    (genre.length ? 1 : 0) +
    (format.length ? 1 : 0) +
    (st ? 1 : 0) +
    (rv === "1" ? 1 : 0) +
    (sort && sort !== "relevance" ? 1 : 0);

  return { n, q, sort, st, rv, brand, author, genre, format };
}

export default function ActiveFiltersBar() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const info = useMemo(() => countActive(sp), [sp]);
  const active = info.n > 0;

  const clear = () => {
    const next = new URLSearchParams(sp);

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

  const openFilters = () => {
    navigate(`/filtros${location.search}`);
  };

  if (!active) return null;

  return (
    <div className="activeFiltersBar" role="region" aria-label="Filtros ativos">
      <div className="activeFiltersLeft">
        <span className="activeFiltersLabel">Filtros ativos</span>
        <span className="activeFiltersCount">{info.n}</span>
      </div>

      <div className="activeFiltersRight">
        <button type="button" className="activeFiltersBtn ghost" onClick={clear}>
          Limpar
        </button>
        <button type="button" className="activeFiltersBtn" onClick={openFilters}>
          Editar
        </button>
      </div>
    </div>
  );
}