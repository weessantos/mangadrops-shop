export async function getAmazonPrice(page, url) {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  await new Promise((r) => setTimeout(r, 2500 + Math.random() * 1500));

  await page.mouse.wheel(0, 400);

  const title = await page.title();

  const price = await page.evaluate(() => {
    const container = document.querySelector(".price-update-row-ww");

    if (container) {
      const el = container.querySelector(".a-offscreen");

      if (el && el.innerText) {
        const value = parseFloat(
          el.innerText
            .replace("R$", "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", "."),
        );

        if (!isNaN(value)) return value;
      }
    }

    const fallback = document.querySelector(
      "#corePriceDisplay_desktop_feature_div .a-offscreen",
    );

    if (fallback && fallback.innerText) {
      const value = parseFloat(
        fallback.innerText
          .replace("R$", "")
          .replace(/\s/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );

      if (!isNaN(value)) return value;
    }

    return null;
  });

  return { price, title };
}
