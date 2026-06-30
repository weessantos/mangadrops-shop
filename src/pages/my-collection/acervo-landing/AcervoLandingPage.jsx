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
