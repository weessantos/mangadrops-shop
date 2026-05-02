import { useMemo } from "react";
import BaseRail from "./ProductRail.jsx";
import { shouldShowProduct } from "../utils/pricing";

function isValidDate(v) {
  return typeof v === "string" && !Number.isNaN(new Date(v).getTime());
}

function getDiffDays(date) {
  const now = new Date();
  const d = new Date(date);
  return (now - d) / (1000 * 60 * 60 * 24);
}

export default function LaunchRail({
  title = "Lançamentos",
  products = [],
  limit = 30,
  initialVisible = 20,
  subtitle = "Atualizado com lançamentos e reposições recentes.",
  meta = "",
  onOpenProduct,
}) {
  const items = useMemo(() => {
    const now = new Date();

    let list = [...products]
      .filter((p) => isValidDate(p.addedAt))
      .filter((p) => {
        const d = new Date(p.addedAt);
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      })
      .filter((p) => shouldShowProduct(p))
      .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

    // fallback
    if (list.length === 0) {
      list = [...products].slice(0, 12);
    }

    return list.slice(0, limit).map((p) => {
      const diffDays = getDiffDays(p.addedAt);

      const badge =
        diffDays <= 7
          ? { label: "NOVO", className: "newBadge" }
          : { label: "RECENTE", className: "recentBadge" };

      return {
        ...p,
        __badge: badge, // 🔥 padronizado pro BaseRail
      };
    });
  }, [products, limit]);

  return (
    <BaseRail
      title={title}
      subtitle={subtitle}
      meta={meta}
      items={items}
      initialVisible={initialVisible}
      onOpenProduct={onOpenProduct}
    />
  );
}
