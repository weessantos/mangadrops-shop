import "../../../../styles/my-collection/acervo-landing/components/al-features-section.css";

import { UserRoundPlus, LibraryBig, Trophy, Share2 } from "lucide-react";

const FEATURES = [
  {
    id: 1,
    icon: UserRoundPlus,
    title: "Crie sua conta",
    description:
      "Cadastre-se gratuitamente e comece a organizar sua coleção em menos de um minuto.",
    accent: "#5314e7",
  },
  {
    id: 2,
    icon: LibraryBig,
    title: "Monte sua coleção",
    description:
      "Encontre suas obras favoritas e marque os volumes que você já possui, deseja comprar ou ainda procura.",
    accent: "#2966ea",
  },
  {
    id: 3,
    icon: Trophy,
    title: "Evolua como colecionador",
    description:
      "Complete coleções, desbloqueie conquistas, suba de nível e acompanhe toda sua evolução.",
    accent: "#ca6a03",
  },
  {
    id: 4,
    icon: Share2,
    title: "Compartilhe seu perfil",
    description:
      "Mostre sua coleção através de um perfil público personalizado e compartilhe sua jornada.",
    accent: "#0c5147",
  },
];

export default function ALFeaturesSection() {
  return (
    <section className="al-features-section">
      <div className="al-features-container">
        <span className="al-features-tag">COMO FUNCIONA</span>

        <h2 className="al-features-title">
          Sua jornada começa em poucos passos.
        </h2>

        <p className="al-features-subtitle">
          Do primeiro volume ao perfil público, o Mangá Drops acompanha toda a
          evolução da sua coleção.
        </p>

        <div className="al-features-grid">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.id}
                className="al-feature-card"
                style={{ "--accent": feature.accent }}
              >
                <div className="al-feature-icon">
                  <Icon size={30} strokeWidth={2} />
                </div>

                <div className="al-feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
