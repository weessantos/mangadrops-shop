import { useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function countActive(sp) {
  const q = (sp.get("q") || "").trim();
  const sort = sp.get("sort") || "relevance";
  const st = sp.get("st") || "";
  const rv = sp.get("rv") || "";
  const price = sp.get("price") || "";
  const discount = sp.get("discount") || "";

  const brand = sp.getAll("brand");
  const author = sp.getAll("author");
  const genre = sp.getAll("genre");
  const format = sp.getAll("format");

  const n =
    (q ? 1 : 0) +
    (brand.length ? 1 : 0) +
    (author.length ? 1 : 0) +
    (genre.length ? 1 : 0) +
    (format.length ? 1 : 0) +
    (price ? 1 : 0) +
    (discount ? 1 : 0) +
    (st ? 1 : 0) +
    (rv === "1" ? 1 : 0) +
    (sort && sort !== "relevance" ? 1 : 0);

  return {
    n,
    q,
    sort,
    st,
    rv,
    price,
    discount,
    brand,
    author,
    genre,
    format,
  };
}

function getPriceLabel(price) {
  if (price === "20") return "Até R$20";
  if (price === "30") return "Até R$30";
  if (price === "40") return "Até R$40";
  if (price === "50") return "Até R$50";
  return "";
}

function getDiscountLabel(discount) {
  if (discount === "20") return "20% OFF+";
  if (discount === "30") return "30% OFF+";
  if (discount === "40") return "40% OFF+";
  if (discount === "50") return "50% OFF+";
  return "";
}

function getSortLabel(sort) {
  if (sort === "new") return "Novidades";
  if (sort === "price_asc") return "Menor preço";
  if (sort === "price_desc") return "Maior preço";
  return "";
}

function getStockLabel(st) {
  if (st === "in") return "Em estoque";
  if (st === "out") return "Sem estoque";
  return "";
}

export default function ActiveFiltersBar() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const info = useMemo(() => countActive(sp), [sp]);
  const active = info.n > 0;

  const chips = useMemo(() => {
    const arr = [];

    if (info.q) arr.push(`Busca: ${info.q}`);
    if (info.brand.length) arr.push(`Editora: ${info.brand.length}`);
    if (info.author.length) arr.push(`Autor: ${info.author.length}`);
    if (info.genre.length) arr.push(`Gênero: ${info.genre.length}`);
    if (info.format.length) arr.push(`Tipo: ${info.format.length}`);

    const priceLabel = getPriceLabel(info.price);
    const discountLabel = getDiscountLabel(info.discount);
    const stockLabel = getStockLabel(info.st);
    const sortLabel = getSortLabel(info.sort);

    if (priceLabel) arr.push(priceLabel);
    if (discountLabel) arr.push(discountLabel);
    if (stockLabel) arr.push(stockLabel);
    if (info.rv === "1") arr.push("Com review");
    if (sortLabel) arr.push(`Ordenar: ${sortLabel}`);

    return arr;
  }, [info]);

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
    next.delete("price");
    next.delete("discount");

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

      {chips.length > 0 && (
        <div className="activeFiltersChips">
          {chips.map((chip) => (
            <span key={chip} className="chip small">
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}