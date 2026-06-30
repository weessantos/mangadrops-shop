import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useInView } from "react-intersection-observer";

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
  const [opened, setOpened] = useState(-1);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  function toggle(index) {
    setOpened((current) => (current === index ? -1 : index));
  }

  return (
    <section className="al-faq-section">
      <div ref={ref} className="al-faq-container">
        <div className="al-faq-header">
          <span
            className={`al-faq-tag ${inView ? "show" : ""}`}
            style={{ transitionDelay: "0ms" }}
          >
            PERGUNTAS FREQUENTES
          </span>

          <h2
            className={`al-faq-title ${inView ? "show" : ""}`}
            style={{ transitionDelay: "150ms" }}
          >
            Tire suas dúvidas antes de começar.
          </h2>

          <p
            className={`al-faq-subtitle ${inView ? "show" : ""}`}
            style={{ transitionDelay: "300ms" }}
          >
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
                className={`al-faq-item ${active ? "active" : ""} ${
                  inView ? "show" : ""
                }`}
                style={{
                  transitionDelay: `${450 + index * 120}ms`,
                }}
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
      </div>
    </section>
  );
}
