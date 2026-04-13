export async function getMLPrice(page, url) {
  try {
    // 🛡️ GOTO COM BLINDAGEM REAL
    const safeGoto = Promise.race([
      page.goto(url, {
        waitUntil: "domcontentloaded",
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout manual goto")), 30000)
      ),
    ]);

    await safeGoto;

    // ⏳ delay humano
    await new Promise((r) =>
      setTimeout(r, 4000 + Math.random() * 4000)
    );

    // 👇 comportamento humano fake
    await page.mouse.move(
      100 + Math.random() * 300,
      200 + Math.random() * 300
    );

    await page.mouse.wheel(0, 300 + Math.random() * 500);

    const title = await page.title();

    // 🚨 DETECÇÃO DE BLOQUEIO
    if (
      !title ||
      title === "Mercado Livre" ||
      title.toLowerCase().includes("atenção necessária") ||
      title.toLowerCase().includes("verifique") ||
      title.toLowerCase().includes("captcha")
    ) {
      console.log("🚨 BLOQUEIO DETECTADO ML");
      return null;
    }

    // ⏳ espera preço
    const priceLoaded = await page
      .waitForSelector(".ui-pdp-price__second-line", {
        timeout: 5000,
      })
      .then(() => true)
      .catch(() => false);

    if (!priceLoaded) {
      console.log("⚠️ Preço não carregou a tempo");
    }

    const price = await page.evaluate(() => {
      const containers = document.querySelectorAll(
        ".ui-pdp-price__second-line"
      );

      if (!containers.length) return null;

      const first = containers[0];

      const fraction = first.querySelector(
        ".andes-money-amount__fraction"
      );
      const cents = first.querySelector(
        ".andes-money-amount__cents"
      );

      if (!fraction) return null;

      const value = fraction.innerText.replace(/\./g, "");
      const decimal = cents ? cents.innerText : "00";

      const finalPrice = parseFloat(`${value}.${decimal}`);

      return isNaN(finalPrice) ? null : finalPrice;
    });

    return { price, title };
  } catch (err) {
    console.log("❌ Erro ML:", err.message, "| URL:", url);
    return null;
  }
}