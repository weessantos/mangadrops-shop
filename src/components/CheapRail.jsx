import { useMemo } from "react";
import ProductRail from "./ProductRail";

export default function CheapRail({
  title = "Mais baratos 💰",
  subtitle = "Os mangás com menor preço do site.",
  products = [],
  limit = 30,
  initialVisible = 20,
  meta = "",
  onOpenProduct,
}) {
  const items = useMemo(() => {
    return [...products]
      .filter((p) => {
        const price = Number(p.best_price);
        return Number.isFinite(price) && price > 0;
      })
      .filter((p) => Number(p.best_price) <= 30)
      .sort((a, b) => Number(a.best_price) - Number(b.best_price))
      .slice(0, limit)
      .map((p) => ({
        ...p,
        __badge: {
          label: "💰 Até R$30",
          className: "cheapBadge",
        },
      }));
  }, [products, limit]);

  return (
    <ProductRail
      title={title}
      subtitle={subtitle}
      meta={meta}
      items={items}
      initialVisible={initialVisible}
      onOpenProduct={onOpenProduct}
    />
  );
}