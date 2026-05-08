import { useMemo } from "react";
import ProductRail from "./ProductRail";

export default function CheapRail({
  title = "",
  subtitle = "",
  titleClassName = "",
  subtitleClassName = "",
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
      sectionId="saldao"
      title={title}
      subtitle={subtitle}
      titleClassName={titleClassName}
      subtitleClassName={subtitleClassName}
      meta={meta}
      items={items}
      viewAllLink="/saldao"
      initialVisible={initialVisible}
      onOpenProduct={onOpenProduct}
    />
  );
}
