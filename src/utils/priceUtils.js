export function getStoreAvailability({ price }) {
  // disponibilidade baseada apenas em preço
  return price != null;
}

export function getOfferData({ amazonHref, amazonPrice, mlHref, mlPrice }) {
  // preço detectado pelo crawler
  const hasAmazonPrice = amazonPrice != null;
  const hasMLPrice = mlPrice != null;

  // link afiliado existente
  const hasAmazonLink = Boolean(amazonHref);
  const hasMLLink = Boolean(mlHref);

  // botão da loja só aparece se tiver link + preço
  const hasAmazon = hasAmazonPrice && hasAmazonLink;
  const hasML = hasMLPrice && hasMLLink;

  // disponibilidade geral do produto
  const isAvailable = hasAmazonPrice || hasMLPrice;

  let bestStore = null;
  let bestPrice = null;

  if (hasAmazonPrice && hasMLPrice) {
    if (amazonPrice <= mlPrice) {
      bestStore = "amazon";
      bestPrice = amazonPrice;
    } else {
      bestStore = "mercadoLivre";
      bestPrice = mlPrice;
    }
  } else if (hasAmazonPrice) {
    bestStore = "amazon";
    bestPrice = amazonPrice;
  } else if (hasMLPrice) {
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