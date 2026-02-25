import { useMemo, useState } from "react";

const uniqSorted = (arr) =>
  Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));

const passesGroup = (selectedSet, itemValueOrArray) => {
  if (!selectedSet || selectedSet.size === 0) return true;
  if (Array.isArray(itemValueOrArray)) return itemValueOrArray.some((v) => selectedSet.has(v));
  return selectedSet.has(itemValueOrArray);
};

const toggleSet = (set, value) => {
  const next = new Set(set);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
};

export function useSeriesFilters(seriesArray) {
  const [filters, setFilters] = useState({
    brand: new Set(),
    author: new Set(),
    genre: new Set(),
    format: new Set(),
  });

  const toggleFilter = (group, value) => {
    setFilters((prev) => ({ ...prev, [group]: toggleSet(prev[group], value) }));
  };

  const clearFilters = () => {
    setFilters({
      brand: new Set(),
      author: new Set(),
      genre: new Set(),
      format: new Set(),
    });
  };

  const options = useMemo(() => {
    return {
      brand: uniqSorted(seriesArray.map((s) => s.brand)),
      format: uniqSorted(seriesArray.map((s) => s.format)),
      author: uniqSorted(seriesArray.flatMap((s) => s.authorList || [])),
      genre: uniqSorted(seriesArray.flatMap((s) => s.genreList || [])),
    };
  }, [seriesArray]);

  const filtered = useMemo(() => {
    return seriesArray.filter((s) => {
      const brandOk = passesGroup(filters.brand, s.brand);
      const authorOk = passesGroup(filters.author, s.authorList || []);
      const formatOk = passesGroup(filters.format, s.format);
      const genreOk = passesGroup(filters.genre, s.genreList || []);
      return brandOk && authorOk && formatOk && genreOk; // ✅ AND entre grupos
    });
  }, [seriesArray, filters]);

  return { filters, options, filtered, toggleFilter, clearFilters };
}