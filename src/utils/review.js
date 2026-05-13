export function getReviewUrl(product) {
  return (
    product?.tiktok ||
    product?.tiktokUrl ||
    product?.video ||
    product?.videoUrl ||
    null
  );
}

export function hasReview(product) {
  return Boolean(getReviewUrl(product));
}