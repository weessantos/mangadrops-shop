import { ChevronDown } from "lucide-react";
import { useState } from "react";

import "../../../../styles/my-collection/acervo-landing/components/al-faq-section.css";

const FAQ_ITEMS = [
  {
    question: "O Mangá Drops é realmente gratuito?",
    answer:
      "Sim. Você pode criar sua conta, organizar sua coleção, acompanhar seu progresso, desbloquear conquistas e compartilhar seu perfil sem pagar nada.",
  },
  {
    question: "Posso acessar pelo celular?",
    answer:
      "Sim. O Mangá Drops funciona diretamente no navegador e foi desenvolvido para oferecer uma ótima experiência em computadores, tablets e smartphones.",
  },
  {
    question: "Preciso instalar algum aplicativo?",
    answer:
      "Não. Basta criar sua conta e acessar o site. Todo o seu acervo fica salvo online e sincronizado automaticamente.",
  },
  {
    question: "Posso compartilhar minha coleção com outras pessoas?",
    answer:
      "Sim. Cada usuário possui um perfil público exclusivo para compartilhar sua coleção, progresso e conquistas com qualquer pessoa através de um link.",
  },
  {
    question: "Quais mangás posso cadastrar?",
    answer:
      "O catálogo cresce constantemente com novas coleções e volumes. Caso uma obra ainda não esteja disponível, ela poderá ser adicionada futuramente.",
  },
  {
    question: "Meus dados ficam salvos?",
    answer:
      "Sim. Sua coleção fica vinculada à sua conta, permitindo continuar exatamente de onde parou em qualquer dispositivo.",
  },
];

export default function ALFAQSection() {
  const [opened, setOpened] = useState(null);

  function toggle(index) {
    setOpened((current) => (current === index ? -1 : index));
  }

  return (
    <section className="al-faq-section">
      <div className="al-faq-container">
        <div className="al-faq-header">
          <span className="al-faq-tag">PERGUNTAS FREQUENTES</span>

          <h2 className="al-faq-title">Tire suas dúvidas antes de começar.</h2>

          <p className="al-faq-subtitle">
            Reunimos as principais perguntas para que você possa conhecer o
            Mangá Drops com tranquilidade.
          </p>
        </div>

        <div className="al-faq-list">
          {FAQ_ITEMS.map((item, index) => {
            const active = opened === index;

            return (
              <article
                key={item.question}
                className={`al-faq-item ${active ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="al-faq-question"
                  onClick={() => toggle(index)}
                >
                  <span>{item.question}</span>

                  <ChevronDown
                    size={22}
                    className={`al-faq-arrow ${active ? "rotate" : ""}`}
                  />
                </button>

                <div className={`al-faq-answer ${active ? "open" : ""}`}>
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="al-final-cta">
          <span className="al-final-tag">COMECE AGORA</span>

          <h2 className="al-final-title">
            Sua coleção merece um lugar
            <br />
            para crescer.
          </h2>

          <p className="al-final-subtitle">
            Crie sua conta gratuitamente, organize seus mangás, acompanhe sua
            evolução e compartilhe sua coleção com outros apaixonados por
            mangás.
          </p>

          <div className="al-final-actions">
            <button className="al-primary-button">
              Criar conta gratuitamente
            </button>

            <button className="al-secondary-button">Entrar</button>
          </div>
        </div>
      </div>
    </section>
  );
}
