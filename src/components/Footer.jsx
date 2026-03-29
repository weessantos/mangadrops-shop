import "../styles/footer.css";

const base = import.meta.env.BASE_URL;
const ML_ICON = `${base}assets/mercadolivre.svg`;
const AMAZON_ICON = `${base}assets/amazon.svg`;

export default function Footer({ scrollToNav }) {
  const handleJump = (target) => {
    scrollToNav?.({ target });
  };

  return (
    <footer className="footer">
      <div className="footerContainer">

        {/* TOP */}
        <div className="footerTop">
          <div className="footerBrand">
            <h2>Mangá Drops</h2>
            <p>
              Compare preços de mangás entre Amazon e Mercado Livre.
              Descubra coleções, lançamentos e economize com segurança.
            </p>
          </div>

          <div className="footerNav">
            <h4>Navegação</h4>
            <button onClick={() => handleJump("home")}>Início</button>
            <button onClick={() => handleJump("colecoes")}>Coleções</button>
            <button onClick={() => handleJump("lancamentos")}>Lançamentos</button>
            <button onClick={() => handleJump("promocoes")}>Descontos</button>
          </div>

          <div className="footerProject">
            <h4>Projeto</h4>
            <p>Feito para fãs de mangá.</p>
            <span>Por Wesley Santos</span>
          </div>
        </div>

        {/* TRUST SECTION */}
        <div className="footerTrust">
          <div>
            <span>🛡️</span>
            <div>
              <strong>Compra 100% segura</strong>
              <p>Você finaliza sua compra diretamente na Amazon ou Mercado Livre</p>
            </div>
          </div>

          <div>
            <a href="#" className="trustBtn amazon">
              <img src={AMAZON_ICON} alt="Amazon" />
            </a>

            <a href="#" className="trustBtn ml">
              <img src={ML_ICON} alt="Mercado Livre" />
            </a>
          </div>
        </div>
      </div>

      <div className="footerBottom">
        © {new Date().getFullYear()} Mangá Drops
      </div>
    </footer>
  );
}