export function getSelectedProduct(
  products,
  volumeId,
) {
  if (!volumeId) return null;

  return (
    products.find((p) => {
      const slug =
        p.url?.split("/").pop();

      return slug === volumeId;
    }) || null
  );
}