import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import CollectionsRail from "../components/CollectionsRail";

import { useSeriesList } from "../hooks/useSeriesList";

export default function CollectionsPage({
  products = [],
  seriesCatalog = [],

  activeSeries = "",

  collectionsSectionRef,

  openSeries,
  clearSeries,
  changeSeriesPage,
}) {
  const navigate = useNavigate();

  // 🔥 COLLECTIONS

  const { seriesList } = useSeriesList(
    products,
    seriesCatalog,
  );

  // 🔥 SCROLL TOP

  const topRef = useRef(null);

  useEffect(() => {
    if (!topRef.current) return;

    const yOffset = -80;

    const y =
      topRef.current.getBoundingClientRect().top +
      window.scrollY +
      yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }, []);

  return (
      <CollectionsRail
        isAllCollectionsPage
        seriesList={seriesList}
        seriesToRender={seriesList}
        activeSeries={activeSeries}
        collectionsSectionRef={
          collectionsSectionRef
        }
        openSeries={openSeries}
        clearSeries={clearSeries}
        changeSeriesPage={changeSeriesPage}
      />
  );
}