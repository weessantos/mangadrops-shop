import { Monitor, Tablet, Smartphone } from "lucide-react";

import "../../../../styles/my-collection/acervo-landing/components/al-devices-section.css";

export default function ALDevicesSection() {
  return (
    <section className="al-devices-section">
      <div className="al-devices-container">
        <div className="al-devices-content">
          <span className="al-devices-tag">
            DISPONÍVEL EM QUALQUER DISPOSITIVO
          </span>

          <h2 className="al-devices-title">
            Sua coleção acompanha você
            <br />
            onde quer que esteja.
          </h2>

          <p className="al-devices-subtitle">
            Acesse o Mangá Drops pelo computador, tablet ou smartphone e tenha
            sua coleção sempre sincronizada. Organize volumes, acompanhe seu
            progresso e compartilhe seu perfil com a mesma experiência em
            qualquer tela.
          </p>

          <div className="al-devices-list">
            <div className="al-device-chip">
              <Monitor size={18} />
              <span>Desktop</span>
            </div>

            <div className="al-device-chip">
              <Tablet size={18} />
              <span>Tablet</span>
            </div>

            <div className="al-device-chip">
              <Smartphone size={18} />
              <span>Smartphone</span>
            </div>
          </div>
        </div>

        <div className="al-devices-preview">
          {/* Mockup do notebook + tablet + celular */}
        </div>
      </div>
    </section>
  );
}