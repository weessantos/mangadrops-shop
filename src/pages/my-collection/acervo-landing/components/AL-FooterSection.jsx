import { FaInstagram, FaTiktok } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "../../../../styles/my-collection/acervo-landing/components/al-footer-section.css";

export default function ALFooter() {
  const navigate = useNavigate();

  return (
    <footer className="al-footer">
      <div className="al-footer-container">
        <div className="al-footer-top">
          <div className="al-footer-brand">
            <div className="al-footer-brand-header">
              <img
                src="/assets/logo.png"
                alt="Mangá Drops"
                className="al-footer-logo"
                onClick={() => navigate("/")}
              />

              <div className="al-footer-brand-title">
                <h3>Mangá Drops</h3>

                <span>Plataforma para colecionadores</span>
              </div>
            </div>

            <div className="al-footer-brand-content">
              <p>
                A plataforma criada para quem ama colecionar mangás. Organize
                seu acervo, acompanhe sua evolução e compartilhe sua coleção com
                o mundo.
              </p>

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
          </div>

          <div className="al-footer-links">
            <div>
              <h4>Plataforma</h4>

              <a
                href="https://www.mangasdrops.online"
                target="_blank"
                rel="noopener noreferrer"
              >
                Compre seu mangá
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/minha-colecao");
                }}
              >
                Minha Coleção
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/minhas-conquistas");
                }}
              >
                Minhas Conquistas
              </a>
            </div>

            <div>
              <h4>Ajuda</h4>

              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();

                  document
                    .getElementById("faq")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Perguntas Frequentes
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/contato");
                }}
              >
                Contato
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/contato");
                }}
              >
                Reportar problema
              </a>
            </div>

            <div>
              <h4>Legal</h4>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/privacidade");
                }}
              >
                Política de Privacidade
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/termos");
                }}
              >
                Termos de Uso
              </a>
            </div>
          </div>
        </div>

        <div className="al-footer-bottom">
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
