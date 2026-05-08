// utils/getReleases.js
import { shouldShowProduct } from "./pricing";

function isValidDate(v) {
  return typeof v === "string" && !Number.isNaN(new Date(v).getTime());
}

function getDiffDays(date) {
  const now = new Date();
  const d = new Date(date);
  return (now - d) / (1000 * 60 * 60 * 24);
}

export function getReleases(products) {
  const now = new Date();

  let list = [...products]
    .filter((p) => isValidDate(p.added_at))
    .filter((p) => {
      const d = new Date(p.added_at);
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 30;
    })
    .filter((p) => shouldShowProduct(p))
    .sort((a, b) => new Date(b.added_at) - new Date(a.added_at));

  if (list.length === 0) {
    list = [...products].slice(0, 12);
  }

  return list.map((p) => {
    const diffDays = getDiffDays(p.added_at);

    const badge =
      diffDays <= 7
        ? { label: "NOVO", className: "newBadge" }
        : { label: "RECENTE", className: "recentBadge" };

    return {
      ...p,
      __badge: badge,
    };
  });
}