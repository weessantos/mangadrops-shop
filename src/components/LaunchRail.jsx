import { useMemo } from "react";
import ProductRail from "./ProductRail.jsx";
import { getReleases } from "../utils/getReleases";

export default function LaunchRail({
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
    return getReleases(products).slice(0, limit);
  }, [products, limit]);

  return (
    <ProductRail
      sectionId="lancamentos"
      title={title}
      subtitle={subtitle}
      titleClassName={titleClassName}
      subtitleClassName={subtitleClassName}
      meta={meta}
      items={items}
      initialVisible={initialVisible}
      viewAllLink="/lancamentos"
      onOpenProduct={onOpenProduct}
    />
  );
}
