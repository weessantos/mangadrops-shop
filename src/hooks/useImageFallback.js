// ============================================================================
// src/hooks/useImageFallback.js
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Resolve imagens com fallback automático.
//
// EX:
//
// const image = useImageFallback(
//   "/assets/op/op01.webp",
//   "/assets/default-cover.webp",
// );
//
// Se a imagem existir:
// → retorna a original
//
// Se der 404:
// → retorna fallback
//
// ============================================================================

import { useEffect, useState } from "react";

export default function useImageFallback(
  src,
  fallback,
) {
  const [imageSrc, setImageSrc] =
    useState(src || fallback);

  useEffect(() => {
    if (!src) {
      setImageSrc(fallback);
      return;
    }

    let cancelled = false;

    const image = new Image();

    image.onload = () => {
      if (!cancelled) {
        setImageSrc(src);
      }
    };

    image.onerror = () => {
      if (!cancelled) {
        setImageSrc(fallback);
      }
    };

    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, fallback]);

  return imageSrc;
}