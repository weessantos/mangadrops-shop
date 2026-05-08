import ProductCard from "./ProductCard";
import "../styles/product-grid.css";

export default function ProductGrid({
  title,
  subtitle,
  items = [],
  onOpen,
}) {
  if (!items.length) return null;

  return (
      <div className="pageBlock">

        <div className="productGrid">
          {items.map((p) => (
            <div className="gridItem" key={p.volumeSlug}>
              <ProductCard product={p} onOpen={onOpen} />
            </div>
          ))}
        </div>

      </div>
  );
}