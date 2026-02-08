    function toggleCategory(card) {
      const sub = card.nextElementSibling;
      sub.classList.toggle('open');

        const badge = card.querySelector('.badge');
        badge.innerText = sub.classList.contains('open')
    ? 'Ocultar volumes ⬆️'
    : 'Ver volumes ⬇️';
    }

    // Microlink — apenas para IMAGEM
    document.querySelectorAll('.card[data-url]').forEach(card => {
      const url = card.getAttribute('data-url');

      fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(data => {
          if (!data || !data.data) return;

          const img = data.data.image?.url;
          if (img) {
            card.querySelector('.thumb').src = img;
          }
        })
        .catch(() => {});
    });
