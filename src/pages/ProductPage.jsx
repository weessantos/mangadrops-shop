/*
|--------------------------------------------------------------------------
| ProductPage
|--------------------------------------------------------------------------
|
| Página dedicada de produto (fallback futuro).
|
| Atualmente o projeto utiliza:
| -> AppShell + ProductModal
|
| Mas este arquivo existe para:
| - futuras páginas SEO
| - compartilhamento social
| - metadata dinâmica
| - OpenGraph
| - indexação Google
| - experiência standalone
|
| Hoje o modal é a experiência principal do produto.
|
|--------------------------------------------------------------------------
*/

import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import ProductContent from "../components/ProductContent";

import { supabaseClient } from "../lib/supabase.js";
import { normalizeProduct } from "../utils/normalizeProduct";

function ProductPage() {
  const { volumeId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
      const { data, error } = await supabaseClient
        .from("series_volumes_view")
        .select("*");

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (!mounted) return;

      const normalized = (data || []).map(
        normalizeProduct,
      );

      const found = normalized.find(
        (p) => p.volumeSlug === volumeId,
      );

      setProduct(found || null);
      setLoading(false);
    }

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [volumeId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#111",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Carregando produto...
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#111",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Produto não encontrado
      </div>
    );
  }

  return (
    <main className="productPage">
      <ProductContent product={product} />
    </main>
  );
}

export default ProductPage;