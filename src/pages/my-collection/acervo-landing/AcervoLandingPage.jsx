import { Helmet } from "react-helmet-async";

import { useLayoutEffect, useEffect, useState } from "react";

import ALLandingScroller from "./components/AL-LandingScroller";
import ALHeroSection from "./components/AL-HeroSection";
import ALFeaturesSection from "./components/AL-FeaturesSection";
import ALCollectionSection from "./components/AL-CollectionSection";
import ALDevicesSection from "./components/AL-DevicesSection";
import ALFAQSection from "./components/AL-FAQSection";
import ALFooterSection from "./components/AL-FooterSection";

import "../../../styles/my-collection/acervo-landing/acervo-landing-page.css";

export default function AcervoLandingPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);

    return () => {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1000);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Helmet>
        <title>
          Organize sua coleção de mangás gratuitamente | Mangá Drops
        </title>

        <meta
          name="description"
          content="Organize sua coleção de mangás gratuitamente. Catalogue volumes, acompanhe seu progresso, desbloqueie conquistas, evolua de nível e compartilhe seu perfil público no Mangá Drops."
        />

        <link
          rel="canonical"
          href="https://www.mangasdrops.online/acervo-manga-drops"
        />

        <meta property="og:type" content="website" />

        <meta
          property="og:title"
          content="Organize sua coleção de mangás gratuitamente | Mangá Drops"
        />

        <meta
          property="og:description"
          content="A plataforma gratuita para organizar sua coleção de mangás."
        />

        <meta
          property="og:url"
          content="https://www.mangasdrops.online/acervo-manga-drops"
        />

        <meta
          property="og:image"
          content="https://www.mangasdrops.online/assets/seo/acervo-og.jpg"
        />
      </Helmet>

      <ALLandingScroller />

      <main className="acervo-landing">
        <section className="landing-slide">
          <ALHeroSection mobile={isMobile} />
        </section>

        <section className="landing-slide">
          <ALFeaturesSection />
        </section>

        <section className="landing-slide">
          <ALCollectionSection />
        </section>

        <section className="landing-slide">
          <ALDevicesSection />
        </section>

        <section className="landing-slide">
          <ALFAQSection />
        </section>

        <section className="landing-slide">
          <ALFooterSection />
        </section>
      </main>
    </>
  );
}
