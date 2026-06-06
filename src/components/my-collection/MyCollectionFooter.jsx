import "../../styles/my-collection/my-collection-footer.css";

function MyCollectionFooter() {
  return (
    <footer className="my-collection-footer">
      <div className="my-collection-footer-content">
        <h3>📚 Sobre o Mangá Drops Acervo</h3>

        <p>
          O Mangá Drops Acervo é uma ferramenta independente de catalogação para
          colecionadores de mangás, criada para acompanhar coleções, registrar
          investimentos e organizar bibliotecas pessoais.
        </p>

        <p>
          Todas as marcas, nomes de obras, personagens, capas e materiais
          promocionais exibidos na plataforma pertencem aos seus respectivos
          autores, editoras e detentores de direitos.
        </p>

        <p>
          As imagens são utilizadas exclusivamente para identificação visual
          das obras e organização das coleções dos usuários.
        </p>

        <p>
          O Mangá Drops não hospeda, distribui ou disponibiliza mangás para
          leitura online, download ou qualquer forma de reprodução de conteúdo
          protegido por direitos autorais.
        </p>

        <div className="my-collection-footer-divider" />

        <p className="my-collection-footer-small">
          © 2026 Mangá Drops • Mangá Drops Acervo
        </p>

        <p className="my-collection-footer-small">
          Projeto independente para fãs e colecionadores de mangás.
        </p>

        <p className="my-collection-footer-small">
          Não afiliado à Panini, JBC, NewPOP, MPEG, Shueisha, Kodansha,
          Shogakukan ou qualquer outra editora ou detentora de direitos.
        </p>
      </div>
    </footer>
  );
}

export default MyCollectionFooter;