import { useMemo, useState } from "react";

const uniqSorted = (arr) =>
  Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));

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

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const getBestPriceValue = (item) => {
  return (
    toNumber(item?.bestPrice?.value) ??
    toNumber(item?.price?.value) ??
    toNumber(item?.priceValue) ??
    toNumber(item?.currentPrice) ??
    toNumber(item?.value) ??
    null
  );
};

const getDiscountPercent = (item) => {
  return (
    toNumber(item?.discountData?.discountPercent) ??
    toNumber(item?.discountPercent) ??
    toNumber(item?.discount?.percent) ??
    0
  );
};

const hasReviewContent = (item) => {
  return Boolean(
    item?.review ||
      item?.reviewText ||
      item?.reviewTitle ||
      item?.reviewContent ||
      item?.reviews?.length
  );
};

export function useSeriesFilters(seriesArray) {
  const [filters, setFilters] = useState({
    brand: new Set(),
    author: new Set(),
    genre: new Set(),
    format: new Set(),
    maxPrice: null,
    minDiscount: null,
    hasReview: false,
  });

  const toggleFilter = (group, value) => {
    setFilters((prev) => ({ ...prev, [group]: toggleSet(prev[group], value) }));
  };

  const setMaxPrice = (value) => {
    setFilters((prev) => ({
      ...prev,
      maxPrice: prev.maxPrice === value ? null : value,
    }));
  };

  const setMinDiscount = (value) => {
    setFilters((prev) => ({
      ...prev,
      minDiscount: prev.minDiscount === value ? null : value,
    }));
  };

  const toggleHasReview = () => {
    setFilters((prev) => ({
      ...prev,
      hasReview: !prev.hasReview,
    }));
  };

  const clearFilters = () => {
    setFilters({
      brand: new Set(),
      author: new Set(),
      genre: new Set(),
      format: new Set(),
      maxPrice: null,
      minDiscount: null,
      hasReview: false,
    });
  };

  const options = useMemo(() => {
    return {
      brand: uniqSorted(seriesArray.map((s) => s.brand)),
      format: uniqSorted(seriesArray.map((s) => s.format)),
      author: uniqSorted(seriesArray.flatMap((s) => s.authorList || [])),
      genre: uniqSorted(seriesArray.flatMap((s) => s.genreList || [])),
      price: [20, 30, 40, 50],
      discount: [20, 30, 40, 50],
    };
  }, [seriesArray]);

  const filtered = useMemo(() => {
    return seriesArray.filter((s) => {
      const brandOk = passesGroup(filters.brand, s.brand);
      const authorOk = passesGroup(filters.author, s.authorList || []);
      const formatOk = passesGroup(filters.format, s.format);
      const genreOk = passesGroup(filters.genre, s.genreList || []);

      const bestPriceValue = getBestPriceValue(s);
      const discountPercent = getDiscountPercent(s);
      const reviewOk = !filters.hasReview || hasReviewContent(s);

      const priceOk =
        filters.maxPrice == null
          ? true
          : bestPriceValue != null && bestPriceValue <= filters.maxPrice;

      const discountOk =
        filters.minDiscount == null
          ? true
          : discountPercent >= filters.minDiscount;

      return (
        brandOk &&
        authorOk &&
        formatOk &&
        genreOk &&
        priceOk &&
        discountOk &&
        reviewOk
      );
    });
  }, [seriesArray, filters]);

  return {
    filters,
    options,
    filtered,
    toggleFilter,
    clearFilters,
    setMaxPrice,
    setMinDiscount,
    toggleHasReview,
  };
}