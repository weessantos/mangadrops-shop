export function getStoreAvailability({ href, price }) {
  return Boolean(href) && price != null;
}

export function getOfferData({ amazonHref, amazonPrice, mlHref, mlPrice }) {
  const hasAmazon = Boolean(amazonHref) && amazonPrice != null;
  const hasML = Boolean(mlHref) && mlPrice != null;

  const isAvailable = hasAmazon || hasML;

  let bestStore = null;
  let bestPrice = null;

  if (hasAmazon && hasML) {
    if (amazonPrice <= mlPrice) {
      bestStore = "amazon";
      bestPrice = amazonPrice;
    } else {
      bestStore = "mercadoLivre";
      bestPrice = mlPrice;
    }
  } else if (hasAmazon) {
    bestStore = "amazon";
    bestPrice = amazonPrice;
  } else if (hasML) {
    bestStore = "mercadoLivre";
    bestPrice = mlPrice;
  }

  return {
    hasAmazon,
    hasML,
    isAvailable,
    hasBoth: hasAmazon && hasML,
    bestStore,
    bestPrice,
  };
}

export function getListPrice(product) {
  const value = product?.coverPrice;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function getDiscountData(product, bestPriceValue) {
  const listPrice = getListPrice(product);

  if (listPrice == null || bestPriceValue == null) {
    return {
      listPrice: listPrice ?? null,
      discountValue: null,
      discountPercent: null,
      hasDiscount: false,
    };
  }

  if (bestPriceValue >= listPrice) {
    return {
      listPrice,
      discountValue: 0,
      discountPercent: 0,
      hasDiscount: false,
    };
  }

  const discountValue = Number((listPrice - bestPriceValue).toFixed(2));
  const discountPercent = Math.round((discountValue / listPrice) * 100);

  return {
    listPrice,
    discountValue,
    discountPercent,
    hasDiscount: true,
  };
}