import { useMemo } from "react";
import ProductRail from "./ProductRail";

export default function PromoRail({
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
      .filter((p) => Number(p.discount) >= 40)
      .sort((a, b) => {
        if (b.discount !== a.discount) {
          return b.discount - a.discount;
        }

        return (a.best_price ?? Infinity) - (b.best_price ?? Infinity);
      })
      .slice(0, limit)
      .map((p) => ({
        ...p,
        __badge: {
          label: `🔥 -${p.discount}%`,
          className: "discountBadge",
        },
      }));
  }, [products, limit]);

  return (
    <ProductRail
      sectionId="promocoes"
      title={title}
      subtitle={subtitle}
      meta={meta}
      items={items}
      viewAllLink="/promocoes"
      initialVisible={initialVisible}
      titleClassName={titleClassName}
      subtitleClassName={subtitleClassName}
      onOpenProduct={onOpenProduct}
    />
  );
}