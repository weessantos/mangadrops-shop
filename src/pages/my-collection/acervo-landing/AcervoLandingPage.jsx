import ALHeroSection from "./components/AL-HeroSection";
import ALFeaturesSection from "./components/AL-FeaturesSection";
import ALCollectionSection from "./components/AL-CollectionSection";
// import ALPublicProfileSection from "./components/AL-PublicProfileSection";
// import ALAchievementsSection from "./components/AL-AchievementsSection";
// import ALAvatarSection from "./components/AL-AvatarSection";
// import ALMobileSection from "./components/AL-MobileSection";
// import ALCTASection from "./components/AL-CTASection";
// import ALFooterSection from "./components/AL-FooterSection";

import "../../../styles/my-collection/acervo-landing/acervo-landing-page.css";

export default function AcervoLandingPage() {
  return (
    <main className="acervo-landing">
      <ALHeroSection />

      <ALFeaturesSection />

      <ALCollectionSection />

      {/*<ALPublicProfileSection />

      <ALAchievementsSection />

      <ALAvatarSection />

      <ALMobileSection />

      <ALCTASection />

      <ALFooterSection /> */}
    </main>
  );
}