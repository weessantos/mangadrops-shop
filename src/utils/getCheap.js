// utils/getCheap.js

import { shouldShowProduct } from "./pricing";

export function getCheap(products) {
  return [...products]
    .filter((p) => shouldShowProduct(p))
    .filter((p) => {
      const price = Number(p.best_price);

      return (
        Number.isFinite(price) &&
        price > 0 &&
        price <= 30
      );
    })
    .sort(
      (a, b) =>
        Number(a.best_price) -
        Number(b.best_price),
    )
    .map((p) => ({
      ...p,

      __badge: {
        label: "💰 Até R$30",
        className: "cheapBadge",
      },
    }));
}