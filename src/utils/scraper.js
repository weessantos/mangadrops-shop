// delay config
const DELAY_MIN = 4000;
const DELAY_MAX = 8000;

export function sleepRandom() {
  const ms = DELAY_MIN + Math.random() * (DELAY_MAX - DELAY_MIN);
  return new Promise(r => setTimeout(r, ms));
}

// retry
export async function getPriceWithRetry(getPrice, page, url, maxRetries = 2) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    const price = await getPrice(page, url);

    if (price !== null) {
      return price;
    }

    attempt++;

    if (attempt <= maxRetries) {
      console.log(`🔁 Retry ${attempt} para ${url}`);

      const delay = 4000 + attempt * 3000;
      await new Promise(r => setTimeout(r, delay));
    }
  }

  return null;
}

// log
export function logProduct(index, total, name, title, price, changed, durationMs) {
  const counter = `[${index}/${total}]`.padStart(8, " ");
  const source = `[${name.padEnd(14, " ")}]`;
  const time = `${(durationMs / 1000).toFixed(1)}s`;

  const cleanTitle = title
    .replace(/\|.*$/, "")
    .trim()
    .slice(0, 45)
    .padEnd(45, " ");

  const priceText =
    price === null
      ? "❌"
      : `R$ ${price.toFixed(2)}`;

  const status = changed ? "💾" : "⏩";

  console.log(`${counter} ${source} ${cleanTitle} | ${priceText} | ${status} | ${time}`);
}