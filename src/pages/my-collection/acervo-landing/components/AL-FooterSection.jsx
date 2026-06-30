import { FaInstagram, FaTiktok } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";

import "../../../../styles/my-collection/acervo-landing/components/al-footer-section.css";

export default function ALFooterSection() {
  const navigate = useNavigate();

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <footer className="al-footer">
      <div ref={ref} className="al-footer-container">
        {/* ================================================= */}
        {/* CTA */}
        {/* ================================================= */}

        <div className="al-footer-cta">
          <span
            className={`al-footer-tag ${inView ? "show" : ""}`}
            style={{ transitionDelay: "0ms" }}
          >
            COMECE AGORA
          </span>

          <h2
            className={`al-footer-title ${inView ? "show" : ""}`}
            style={{ transitionDelay: "150ms" }}
          >
            Sua coleção merece um lugar
            <br />
            para crescer.
          </h2>

          <p
            className={`al-footer-subtitle ${inView ? "show" : ""}`}
            style={{ transitionDelay: "300ms" }}
          >
            Organize seus mangás, acompanhe sua evolução, desbloqueie conquistas
            e compartilhe sua coleção gratuitamente com outros colecionadores.
          </p>

          <div
            className={`al-footer-actions ${inView ? "show" : ""}`}
            style={{ transitionDelay: "450ms" }}
          >
            <button
              className="al-primary-button"
              onClick={() => navigate("/auth/registrar")}
            >
              Criar conta gratuitamente
            </button>

            <button
              className="al-secondary-button"
              onClick={() => navigate("/auth/login")}
            >
              Já tenho uma conta
            </button>
          </div>
        </div>

        <div
          className={`al-footer-divider ${inView ? "show" : ""}`}
          style={{ transitionDelay: "600ms" }}
        />

        {/* ================================================= */}
        {/* CONTEÚDO */}
        {/* ================================================= */}

        <div
          className={`al-footer-content ${inView ? "show" : ""}`}
          style={{ transitionDelay: "750ms" }}
        >
          <div className="al-footer-brand">
            <img
              src="/assets/logo.png"
              alt="Mangá Drops"
              className="al-footer-logo"
              onClick={() => navigate("/")}
            />

            <div className="al-footer-brand-text">
              <h3>Mangá Drops</h3>

              <p>
                A plataforma criada para quem ama colecionar mangás. Organize
                seu acervo, acompanhe sua evolução e compartilhe sua coleção com
                o mundo.
              </p>
            </div>

            <div className="al-footer-socials">
              <a
                href="https://www.tiktok.com/@_mangadrops"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <FaTiktok size={18} />
              </a>

              <a
                href="https://www.instagram.com/_mangadrops"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram size={18} />
              </a>
            </div>
          </div>

          <div className="al-footer-links">
            <div>
              <h4>Plataforma</h4>

              <button onClick={() => navigate("/minha-colecao")}>
                Minha coleção
              </button>

              <button onClick={() => navigate("/minhas-conquistas")}>
                Minhas conquistas
              </button>

              <button onClick={() => navigate("/")}>Loja de Mangás</button>
            </div>

            <div>
              <h4>Ajuda</h4>

              <button
                onClick={() =>
                  document
                    .getElementById("faq")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Perguntas frequentes
              </button>

              <button onClick={() => navigate("/contato")}>Contato</button>

              <button onClick={() => navigate("/contato")}>
                Reportar problema
              </button>
            </div>

            <div>
              <h4>Legal</h4>

              <button onClick={() => navigate("/privacidade")}>
                Política de Privacidade
              </button>

              <button onClick={() => navigate("/termos")}>Termos de Uso</button>
            </div>
          </div>
        </div>

        <div
          className={`al-footer-bottom ${inView ? "show" : ""}`}
          style={{ transitionDelay: "900ms" }}
        >
          <span>
            © {new Date().getFullYear()} Mangá Drops. Todos os direitos
            reservados.
          </span>

          <span>Feito com ❤️ para colecionadores.</span>
        </div>
      </div>
    </footer>
  );
}
