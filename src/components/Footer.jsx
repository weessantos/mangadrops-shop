// ============================================================================
// src/components/Footer.jsx
// ============================================================================
//
// RESPONSABILIDADE DESTE COMPONENTE
// ----------------------------------------------------------------------------
// Renderiza o rodapé do site.
//
// Ele é responsável por:
//
// ✅ Navegação rápida
// ✅ Informações do projeto
// ✅ Informações de confiança
// ✅ Ícones globais
//
//
//
// O QUE ESTE COMPONENTE NÃO DEVE FAZER
// ----------------------------------------------------------------------------
//
// ❌ Não deve montar caminhos manualmente
// ❌ Não deve conhecer assets
// ❌ Não deve acessar API
// ❌ Não deve conter regras de negócio
//
// ============================================================================

import "../styles/footer.css";
import { img } from "../utils/images";

// ============================================================================
// ÍCONES GLOBAIS
// ============================================================================
//
// RESPONSABILIDADE
// ----------------------------------------------------------------------------
// Resolve imagens compartilhadas do projeto.
//
// Estas imagens não pertencem
// a uma obra específica.
//
// ============================================================================

const ML_ICON = img({
  prefix: "mercadolivre.svg",
});

const AMAZON_ICON = img({
  prefix: "amazon.svg",
});

// ============================================================================
// FOOTER
// ============================================================================

export default function Footer({ scrollToNav }) {
  // ==========================================================================
  // NAVEGAÇÃO
  // ==========================================================================
  //
  // RESPONSABILIDADE
  // --------------------------------------------------------------------------
  // Dispara navegação para seções do site.
  //
  // ==========================================================================

  const handleJump = (target) => {
    scrollToNav?.({ target });
  };

  return (
    <footer className="footer">
      <div className="footerContainer">
        {/* ========================= */}
        {/* TOPO */}
        {/* ========================= */}

        <div className="footerTop">
          <div className="footerBrand">
            <h2>Mangá Drops</h2>

            <p>
              Compare preços de mangás entre Amazon e Mercado Livre. Descubra
              coleções, lançamentos e economize com segurança.
            </p>
          </div>

          <div className="footerNav">
            <h4>Navegação</h4>

            <button onClick={() => handleJump("home")}>Início</button>

            <button onClick={() => handleJump("colecoes")}>Coleções</button>

            <button onClick={() => handleJump("lancamentos")}>
              Lançamentos
            </button>

            <button onClick={() => handleJump("promocoes")}>Descontos</button>
          </div>

          <div className="footerProject">
            <h4>Projeto</h4>

            <p>Feito para fãs de mangá.</p>

            <span>Por Wesley Santos</span>
          </div>
        </div>

        {/* ========================= */}
        {/* CONFIANÇA */}
        {/* ========================= */}

        <div className="footerTrust">
          <div>
            <span>🛡️</span>

            <div>
              <strong>Compra 100% segura</strong>

              <p>
                Você finaliza sua compra diretamente na Amazon ou Mercado Livre
              </p>
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

      {/* ========================= */}
      {/* RODAPÉ */}
      {/* ========================= */}

      <div className="footerBottom">
        <p>
          Amazon e o logotipo da Amazon são marcas comerciais da Amazon.com,
          Inc. ou de suas afiliadas
        </p>
        © {new Date().getFullYear()} Mangá Drops
      </div>
    </footer>
  );
}
