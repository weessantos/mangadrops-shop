import { useEffect, useRef, useState } from "react";
import { supabaseClient } from "../../../lib/supabase";

export default function useALCollectionSectionData() {
  const featuredRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);

  // Valores reais (já arredondados)
  const [stats, setStats] = useState({
    totalVolumes: 0,
    totalSeries: 0,
  });

  // Valores exibidos na tela (animados)
  const [displayStats, setDisplayStats] = useState({
    totalVolumes: 0,
    totalSeries: 0,
  });

  const [covers, setCovers] = useState([]);

  const hasAnimated = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.35,
      },
    );

    if (featuredRef.current) {
      observer.observe(featuredRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (hasAnimated.current) return;
    if (stats.totalVolumes === 0) return;

    hasAnimated.current = true;

    animateNumbers();
  }, [isVisible, stats]);

  function roundVolumes(value) {
    if (value < 100) return value;

    const hundreds = Math.floor(value / 100) * 100;
    const remainder = value % 100;

    if (remainder < 25) return hundreds;
    if (remainder < 75) return hundreds + 50;

    return hundreds + 100;
  }

  // Sempre termina em 0 ou 5
  function roundSeries(value) {
    return Math.round(value / 5) * 5;
  }

  function animateNumbers() {
    const start = performance.now();
    const duration = 1400;

    function frame(now) {
      const t = Math.min((now - start) / duration, 1);

      // Ease Out Cubic
      const progress = 1 - Math.pow(1 - t, 3);

      setDisplayStats({
        totalVolumes: Math.floor(progress * stats.totalVolumes),
        totalSeries: Math.floor(progress * stats.totalSeries),
      });

      if (t < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  async function loadData() {
    try {
      const [volumesResult, seriesResult, coversResult] = await Promise.all([
        supabaseClient
          .from("volumes")
          .select("*", { count: "exact", head: true }),

        supabaseClient
          .from("series")
          .select("*", { count: "exact", head: true }),

        supabaseClient.from("series").select("thumb").order("title"),
      ]);

      setStats({
        totalVolumes: roundVolumes(volumesResult.count ?? 0),
        totalSeries: roundSeries(seriesResult.count ?? 0),
      });

      const thumbs = (coversResult.data ?? []).map((serie) => serie.thumb);

      setCovers([...thumbs, ...thumbs]);
      
    } catch (error) {
      console.error("Erro ao carregar dados da landing:", error);
    }
  }

  return {
    featuredRef,
    isVisible,

    stats,
    displayStats,

    covers,
  };
}
