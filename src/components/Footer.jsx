import "../styles/footer.css";

export default function Footer({ scrollToNav }) {
  const handleJump = (target) => {
    scrollToNav?.({ target });
  };

  return (
    <footer className="footer">
      <div className="footerContainer">
        <div className="footerCol brand">
          <h2 className="footerLogo">Mangá Drops</h2>
          <p>
            Acompanhe coleções de mangás, lançamentos e os melhores preços da internet.
            Compare ofertas da Amazon e Mercado Livre em um só lugar.
          </p>
        </div>

        <div className="footerCol">
          <h3>Navegação</h3>
          <ul className="footerNavList">
            <li>
              <button type="button" className="footerLinkBtn" onClick={() => handleJump("home")}>
                Início
              </button>
            </li>
            <li>
              <button type="button" className="footerLinkBtn" onClick={() => handleJump("colecoes")}>
                Coleções
              </button>
            </li>
            <li>
              <button type="button" className="footerLinkBtn" onClick={() => handleJump("lancamentos")}>
                Lançamentos
              </button>
            </li>
            <li>
              <button type="button" className="footerLinkBtn" onClick={() => handleJump("promocoes")}>
                Melhores descontos
              </button>
            </li>
          </ul>
        </div>

        <div className="footerCol">
          <h3>Afiliados</h3>
          <p>
            Este site participa de programas de afiliados da Amazon e Mercado Livre.
            Podemos receber uma pequena comissão nas compras feitas pelos links,
            sem custo adicional para você.
          </p>
        </div>

        <div className="footerCol">
          <h3>Projeto</h3>
          <p>Projeto independente feito para fãs de mangá.</p>
          <p className="footerAuthor">Criado por Wesley Santos</p>
        </div>
      </div>

      <div className="footerBottom">
        © {new Date().getFullYear()} Mangá Drops — Todos os direitos reservados
      </div>
    </footer>
  );
}
