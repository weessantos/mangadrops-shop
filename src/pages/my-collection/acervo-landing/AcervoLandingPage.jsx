import ALHeroSection from "./components/AL-HeroSection";
import ALFeaturesSection from "./components/AL-FeaturesSection";
import ALCollectionSection from "./components/AL-CollectionSection";
import ALDevicesSection from "./components/AL-DevicesSection";
import ALFAQSection from "./components/AL-FAQSection";
import ALFooterSection from "./components/AL-FooterSection";

import "../../../styles/my-collection/acervo-landing/acervo-landing-page.css";

export default function AcervoLandingPage() {
  return (
    <main className="acervo-landing">
      <ALHeroSection />

      <ALFeaturesSection />

      <ALCollectionSection />

      <ALDevicesSection />

      <ALFAQSection />

      <ALFooterSection />
    </main>
  );
}