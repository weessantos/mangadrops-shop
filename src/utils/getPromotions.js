// utils/getPromotions.js

import { shouldShowProduct } from "./pricing";

export function getPromotions(products) {

  return products
    .filter((p) => shouldShowProduct(p))
    .filter((p) => Number(p.discount) >= 40)
    .sort((a, b) => Number(b.discount) - Number(a.discount))
    .map((p) => ({
      ...p,

      __badge: {
        label: `-${p.discount}%`,
        className:
          Number(p.discount) >= 40
            ? "discountBadge"
            : "promoBadge",
      },
    }));
}