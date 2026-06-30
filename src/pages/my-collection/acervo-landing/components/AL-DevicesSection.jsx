import { Monitor, Tablet, Smartphone } from "lucide-react";
import { useInView } from "react-intersection-observer";
import "../../../../styles/my-collection/acervo-landing/components/al-devices-section.css";

export default function ALDevicesSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  return (
    <section className="al-devices-section">
      <div ref={ref} className="al-devices-container">
        <div className="al-devices-content">
          <span
            className={`al-devices-tag ${inView ? "show" : ""}`}
            style={{ transitionDelay: "0ms" }}
          >
            DISPONÍVEL EM QUALQUER DISPOSITIVO
          </span>

          <h2
            className={`al-devices-title ${inView ? "show" : ""}`}
            style={{ transitionDelay: "150ms" }}
          >
            Sua coleção acompanha você
            <br />
            onde quer que esteja.
          </h2>

          <p
            className={`al-devices-subtitle ${inView ? "show" : ""}`}
            style={{ transitionDelay: "300ms" }}
          >
            Acesse o Mangá Drops pelo computador, tablet ou smartphone e tenha
            sua coleção sempre sincronizada. Organize volumes, acompanhe seu
            progresso e compartilhe seu perfil com a mesma experiência em
            qualquer tela.
          </p>

          <div className="al-devices-list">
            <div
              className={`al-device-chip ${inView ? "show" : ""}`}
              style={{ transitionDelay: "450ms" }}
            >
              <Monitor size={18} />
              <span>Desktop</span>
            </div>

            <div
              className={`al-device-chip ${inView ? "show" : ""}`}
              style={{ transitionDelay: "550ms" }}
            >
              <Tablet size={18} />
              <span>Tablet</span>
            </div>

            <div
              className={`al-device-chip ${inView ? "show" : ""}`}
              style={{ transitionDelay: "650ms" }}
            >
              <Smartphone size={18} />
              <span>Smartphone</span>
            </div>
          </div>
        </div>

        <div className={`al-devices-preview ${inView ? "show" : ""}`}>
          <div className="al-devices-stack">
            {/* ================================================= */}
            {/* DESKTOP */}
            {/* ================================================= */}

            <div className="al-device-scene al-device-scene-desktop">
              <img
                src="/assets/my-collection/landing/imac.webp"
                alt="Mangá Drops no Desktop"
                className={`al-device-mockup al-device-imac ${inView ? "show" : ""}`}
                style={{ transitionDelay: "800ms" }}
              />

              <img
                src="/assets/my-collection/landing/ipad.webp"
                alt="Mangá Drops no iPad"
                className={`al-device-mockup al-device-ipad ${inView ? "show" : ""}`}
                style={{ transitionDelay: "1000ms" }}
              />

              <img
                src="/assets/my-collection/landing/iphone.webp"
                alt="Mangá Drops no iPhone"
                className={`al-device-mockup al-device-iphone ${inView ? "show" : ""}`}
                style={{ transitionDelay: "1100ms" }}
              />
            </div>

            {/* ================================================= */}
            {/* TABLET - DESKTOP */}
            {/* ================================================= */}

            <div className="al-device-scene al-device-scene-imac">
              <img
                src="/assets/my-collection/landing/imac.webp"
                alt="Mangá Drops no Desktop"
                className="al-device-mockup al-device-imac-single"
              />
            </div>

            {/* ================================================= */}
            {/* TABLET - IPAD */}
            {/* ================================================= */}

            <div className="al-device-scene al-device-scene-ipad">
              <img
                src="/assets/my-collection/landing/ipad.webp"
                alt="Mangá Drops no iPad"
                className="al-device-mockup al-device-ipad-single"
              />
            </div>

            {/* ================================================= */}
            {/* TABLET - IPHONE */}
            {/* ================================================= */}

            <div className="al-device-scene al-device-scene-iphone">
              <img
                src="/assets/my-collection/landing/iphone.webp"
                alt="Mangá Drops no iPhone"
                className="al-device-mockup al-device-iphone-single"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
