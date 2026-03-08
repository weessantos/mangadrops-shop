import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

import { products } from "../src/data/products/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRICES_PATH = path.resolve(__dirname, "../src/data/prices.json");
const CONCURRENCY = 2;
const TEST_PREFIXES = ["op-"];
// Se quiser testar IDs específicos, preencha aqui. Ex: ["op-18", "op-19"]
const TEST_ONLY_IDS = ["op-18", "op-37"];
const REQUEST_TIMEOUT = 20000;
const BETWEEN_PRODUCTS_DELAY_MS = 250;
const ML_NAVIGATION_TIMEOUT = 35000;
const ML_DEBUG = true;

let browserPromise = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePriceFromText(text) {
  if (!text) return null;

  const normalized = String(text)
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .replace("R$", "")
    .trim();

  const match = normalized.match(/\d{1,3}(?:\.\d{3})*,\d{2}|\d+(?:,\d{2})?/);
  if (!match) return null;

  const value = match[0].replace(/\./g, "").replace(",", ".");
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatCandidateList(values) {
  if (!values.length) return "nenhum";
  return values.join(", ");
}

function uniqueSortedNumbers(values) {
  return [...new Set(values.filter((value) => Number.isFinite(value) && value > 0))].sort(
    (a, b) => a - b
  );
}

function readExistingPrices() {
  try {
    if (!fs.existsSync(PRICES_PATH)) return {};
    const raw = fs.readFileSync(PRICES_PATH, "utf-8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePrices(prices) {
  fs.writeFileSync(PRICES_PATH, JSON.stringify(prices, null, 2), "utf-8");
}

function getRequestHeaders() {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
  };
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
}

async function closeBrowser() {
  if (!browserPromise) return;
  try {
    const browser = await browserPromise;
    await browser.close();
  } catch {
    // ignore
  } finally {
    browserPromise = null;
  }
}

function isMercadoLivreProductUrl(url) {
  if (!url) return false;
  return (
    /\/p\/MLB\d+/i.test(url) ||
    /produto\.mercadolivre\.com\.br/i.test(url) ||
    /articulo\.mercadolibre\.com/i.test(url)
  );
}

function extractMercadoLivreGoUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const go = parsed.searchParams.get("go");
    if (!go) return null;

    const decoded = decodeURIComponent(go);
    return isMercadoLivreProductUrl(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

async function resolveMercadoLivreProductUrl(page, url) {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: ML_NAVIGATION_TIMEOUT,
  });

  await page.waitForTimeout(2500);

  let currentUrl = page.url();
  if (isMercadoLivreProductUrl(currentUrl)) {
    return currentUrl;
  }

  const goProductUrl = extractMercadoLivreGoUrl(currentUrl);
  if (goProductUrl) {
    await page.goto(goProductUrl, {
      waitUntil: "domcontentloaded",
      timeout: ML_NAVIGATION_TIMEOUT,
    });
    await page.waitForTimeout(2500);

    currentUrl = page.url();
    if (isMercadoLivreProductUrl(currentUrl)) {
      return currentUrl;
    }

    return goProductUrl;
  }

  const findHrefInDom = async () => {
    return page.evaluate(() => {
      const normalizeHref = (href) => {
        if (!href) return null;
        try {
          return new URL(href, window.location.href).href;
        } catch {
          return null;
        }
      };

      const isProductHref = (href) => {
        if (!href) return false;
        return (
          /\/p\/MLB\d+/i.test(href) ||
          href.includes("produto.mercadolivre.com.br") ||
          href.includes("articulo.mercadolibre.com")
        );
      };

      const anchors = Array.from(document.querySelectorAll("a[href]"));

      for (const anchor of anchors) {
        const href = normalizeHref(anchor.getAttribute("href") || "");
        if (isProductHref(href)) return href;
      }

      for (const anchor of anchors) {
        const text = (anchor.textContent || "").trim().toLowerCase();
        if (text.includes("ir para produto") || text.includes("ver produto")) {
          return normalizeHref(anchor.getAttribute("href") || "");
        }
      }

      const ogUrl = document.querySelector('meta[property="og:url"]')?.getAttribute("content");
      if (isProductHref(ogUrl)) return normalizeHref(ogUrl);

      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
      if (isProductHref(canonical)) return normalizeHref(canonical);

      const html = document.documentElement.innerHTML;
      const domains = ["produto.mercadolivre.com.br", "articulo.mercadolibre.com"];

      for (const domain of domains) {
        const start = html.indexOf(domain);
        if (start === -1) continue;
        const prefix = html.lastIndexOf("https", start);
        if (prefix === -1) continue;

        let end = start;
        while (end < html.length && !['"', "'", "<", " ", "\\n"].includes(html[end])) {
          end += 1;
        }

        const raw = html.slice(prefix, end).replace(/\\u002F/g, "/");
        const href = normalizeHref(raw);
        if (isProductHref(href)) return href;
      }

      return null;
    });
  };

  let productHref = await findHrefInDom();

  if (!productHref) {
    const button = page.getByRole("link", { name: /ir para produto|ver produto/i }).first();
    if ((await button.count().catch(() => 0)) > 0) {
      await button.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(2000);
      currentUrl = page.url();
      if (isMercadoLivreProductUrl(currentUrl)) {
        return currentUrl;
      }
      productHref = await findHrefInDom();
    }
  }

  if (!productHref) {
    return currentUrl;
  }

  await page.goto(productHref, {
    waitUntil: "domcontentloaded",
    timeout: ML_NAVIGATION_TIMEOUT,
  });

  await page.waitForTimeout(2500);
  return page.url();
}

async function extractMercadoLivreAffiliatePriceFromPage(page, productId) {
  const result = await page.evaluate(() => {
    const parseBrPrice = (text) => {
      if (!text) return null;
      const normalized = String(text)
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const match = normalized.match(/R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}|\d{1,3}(?:\.\d{3})*,\d{2}/i);
      if (!match) return null;

      const number = Number(
        match[0]
          .replace("R$", "")
          .replace(/\s+/g, "")
          .replace(/\./g, "")
          .replace(",", ".")
      );

      return Number.isFinite(number) ? number : null;
    };

    const isVisible = (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const isInsideBadArea = (el) => {
      return Boolean(
        el.closest(
          [
            "header",
            "footer",
            "nav",
            "script",
            "style",
            "noscript",
            "[aria-hidden='true']",
            "[hidden]",
            ".recommendations",
            ".reco-carousel",
            ".poly-card",
            ".carousel",
          ].join(",")
        )
      );
    };

    const candidates = [];

    const selectors = [
      "[class*='price']",
      "[data-testid*='price']",
      "[aria-label*='preço' i]",
      "[aria-label*='price' i]",
      ".andes-money-amount",
      ".ui-search-price",
    ];

    for (const selector of selectors) {
      const nodes = Array.from(document.querySelectorAll(selector));
      for (const node of nodes) {
        if (!isVisible(node) || isInsideBadArea(node)) continue;

        const text = (node.textContent || node.innerText || "").trim();
        const value = parseBrPrice(text);
        if (!Number.isFinite(value) || value <= 0) continue;

        const rect = node.getBoundingClientRect();
        const score = Math.abs(rect.top) + Math.abs(rect.left / 10);
        candidates.push({ value, text, selector, score });
      }
    }

    const actionButton = Array.from(document.querySelectorAll("a, button")).find((el) => {
      const text = (el.textContent || "").trim().toLowerCase();
      return text.includes("ir para produto") || text.includes("ver produto");
    });

    if (actionButton) {
      let current = actionButton.parentElement;
      let level = 0;

      while (current && level < 6) {
        const nodes = Array.from(current.querySelectorAll("*"));
        for (const node of nodes) {
          if (!isVisible(node) || isInsideBadArea(node)) continue;
          const text = (node.textContent || node.innerText || "").trim();
          const value = parseBrPrice(text);
          if (!Number.isFinite(value) || value <= 0) continue;

          const rect = node.getBoundingClientRect();
          const score = Math.abs(rect.top) + Math.abs(rect.left / 10) - 200;
          candidates.push({ value, text, selector: "button-neighborhood", score });
        }
        current = current.parentElement;
        level += 1;
      }
    }

    const bodyText = document.body?.innerText || "";
    const regex = /R\$\s*\d{1,3}(?:\.\d{3})*,\d{2}/g;
    const bodyMatches = bodyText.match(regex) || [];
    for (const match of bodyMatches.slice(0, 20)) {
      const value = parseBrPrice(match);
      if (Number.isFinite(value) && value > 0) {
        candidates.push({ value, text: match, selector: "body-regex", score: 100000 + value });
      }
    }

    candidates.sort((a, b) => a.score - b.score || a.value - b.value);

    return {
      best: candidates[0] || null,
      candidates: candidates.slice(0, 10),
      hasActionButton: Boolean(actionButton),
    };
  });

  const uniqueValues = uniqueSortedNumbers((result.candidates || []).map((item) => item.value));

  if (ML_DEBUG) {
    console.log(
      `[ML DEBUG] ${productId} -> candidatos afiliado: ${formatCandidateList(uniqueValues)}`
    );
  }

  if (result.best?.value) {
    return result.best.value;
  }

  return null;
}

async function extractMercadoLivrePriceFromPage(page, productId) {
  const result = await page.evaluate(() => {
    const parseBrPrice = (text) => {
      if (!text) return null;
      const normalized = String(text)
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .replace("R$", "")
        .trim();

      const match = normalized.match(/\d{1,3}(?:\.\d{3})*,\d{2}|\d+(?:,\d{2})?/);
      if (!match) return null;

      const value = Number(match[0].replace(/\./g, "").replace(",", "."));
      return Number.isFinite(value) ? value : null;
    };

    const isVisible = (el) => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const isInsideRecommendations = (el) => {
      return Boolean(
        el.closest(
          [
            "[data-testid='recommendations']",
            "[data-testid='reco-carousel']",
            ".ui-recommendations-card",
            ".poly-card",
            ".recommendations",
            ".andes-carousel-snapped__container",
            ".ui-pdp-recommendations",
            ".ui-pdp-carousel",
          ].join(",")
        )
      );
    };

    const parseContainer = (root) => {
      if (!root) return null;

      const fraction = root.querySelector(".andes-money-amount__fraction")?.textContent?.trim() || "";
      const cents = root.querySelector(".andes-money-amount__cents")?.textContent?.trim() || "";

      if (fraction) {
        const wholeDigits = fraction.replace(/\./g, "").replace(/[^\d]/g, "");
        const centsDigits = (cents || "00").replace(/[^\d]/g, "").padEnd(2, "0").slice(0, 2);
        const value = Number(`${wholeDigits}.${centsDigits}`);
        if (Number.isFinite(value) && value > 0) return value;
      }

      return parseBrPrice(root.textContent || root.innerText || "");
    };

    const strongSelectors = [
      ".ui-pdp-price__second-line .andes-money-amount",
      ".ui-pdp-price__main-container .andes-money-amount",
      "[data-testid='price-part'] .andes-money-amount",
      ".ui-pdp-price .andes-money-amount",
      ".ui-pdp-price__second-line",
      ".ui-pdp-price__main-container",
      "[data-testid='price-part']",
      ".ui-pdp-price",
    ];

    const strongHits = [];
    for (const selector of strongSelectors) {
      const nodes = Array.from(document.querySelectorAll(selector));
      for (const node of nodes) {
        if (!isVisible(node)) continue;
        if (isInsideRecommendations(node)) continue;
        const value = parseContainer(node);
        if (Number.isFinite(value) && value > 0) {
          const rect = node.getBoundingClientRect();
          strongHits.push({ selector, value, top: rect.top, left: rect.left });
        }
      }
      if (strongHits.length) break;
    }

    strongHits.sort((a, b) => a.top - b.top || a.left - b.left);

    const fallbackCandidates = [];
    const metaPrice = document.querySelector('meta[itemprop="price"]')?.getAttribute("content");
    const metaValue = parseBrPrice(metaPrice);
    if (metaValue) fallbackCandidates.push(metaValue);

    const ogPrice = document.querySelector('meta[property="product:price:amount"]')?.getAttribute("content");
    const ogValue = parseBrPrice(ogPrice);
    if (ogValue) fallbackCandidates.push(ogValue);

    return { strongHits, fallbackCandidates };
  });

  const uniqueSelectorValues = uniqueSortedNumbers(result.strongHits.map((item) => item.value));
  const fallbackValues = uniqueSortedNumbers(result.fallbackCandidates);

  if (ML_DEBUG) {
    console.log(`[ML DEBUG] ${productId} -> candidatos HTML produto: ${formatCandidateList(uniqueSelectorValues)}`);
    if (fallbackValues.length) {
      console.log(
        `[ML DEBUG] ${productId} -> candidatos fallback produto: ${formatCandidateList(fallbackValues)}`
      );
    }
  }

  if (result.strongHits.length) {
    return result.strongHits[0].value;
  }

  if (fallbackValues.length) {
    return fallbackValues[0];
  }

  return null;
}

async function getMercadoLivreAffiliatePrice(page, url, productId) {
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: ML_NAVIGATION_TIMEOUT,
    });

    await page.waitForTimeout(2500);

    const affiliatePrice = await extractMercadoLivreAffiliatePriceFromPage(page, productId);
    if (affiliatePrice !== null) {
      if (ML_DEBUG) {
        console.log(`[ML DEBUG] ${productId} -> preço via afiliado: ${affiliatePrice}`);
      }
      return affiliatePrice;
    }

    return null;
  } catch (error) {
    if (ML_DEBUG && error?.message) {
      console.log(`[ML DEBUG] ${productId} -> erro afiliado: ${error.message}`);
    }
    return null;
  }
}

async function getMercadoLivrePrice(url, productId) {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: getRequestHeaders()["User-Agent"],
    locale: "pt-BR",
    viewport: { width: 1366, height: 900 },
    extraHTTPHeaders: {
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    },
  });

  const page = await context.newPage();

  try {
    const affiliatePrice = await getMercadoLivreAffiliatePrice(page, url, productId);
    if (affiliatePrice !== null) {
      return affiliatePrice;
    }

    const productUrl = await resolveMercadoLivreProductUrl(page, url);

    if (ML_DEBUG) {
      console.log(`[ML DEBUG] ${productId} -> product URL: ${productUrl}`);
    }

    if (!isMercadoLivreProductUrl(productUrl)) {
      if (ML_DEBUG) {
        console.log(`[ML DEBUG] ${productId} -> não caiu em página de produto`);
      }
      return null;
    }

    await page.waitForLoadState("domcontentloaded", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);

    return await extractMercadoLivrePriceFromPage(page, productId);
  } catch (error) {
    console.log(`[ML] Erro ao buscar preço: ${productId} -> ${url}`);
    if (ML_DEBUG && error?.message) {
      console.log(`[ML DEBUG] ${productId} -> erro: ${error.message}`);
    }
    return null;
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function getAmazonPrice(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 5,
      timeout: REQUEST_TIMEOUT,
      headers: getRequestHeaders(),
    });

    const $ = cheerio.load(response.data);

    const priceContainers = [
      ".priceToPay",
      ".apexPriceToPay",
      ".reinventPricePriceToPayMargin",
      "#corePriceDisplay_desktop_feature_div .priceToPay",
      "#corePriceDisplay_desktop_feature_div .apexPriceToPay",
      "#corePrice_feature_div .priceToPay",
    ];

    for (const containerSelector of priceContainers) {
      const container = $(containerSelector).first();
      if (!container.length) continue;

      const whole = container.find(".a-price-whole").first().text().trim();
      const fraction = container.find(".a-price-fraction").first().text().trim();

      if (whole) {
        const normalizedWhole = whole.replace(/\./g, "").replace(/[^\d]/g, "");
        const normalizedFraction = (fraction || "00").replace(/[^\d]/g, "");
        const composed = `${normalizedWhole}.${normalizedFraction.padEnd(2, "0").slice(0, 2)}`;

        const value = Number(composed);
        if (Number.isFinite(value) && value > 0) {
          return value;
        }
      }

      const offscreen = container.find(".a-offscreen").first().text().trim();
      const offscreenValue = parsePriceFromText(offscreen);
      if (offscreenValue !== null && offscreenValue > 0) {
        return offscreenValue;
      }
    }

    const selectors = [
      "#price_inside_buybox",
      "#priceblock_dealprice",
      "#priceblock_saleprice",
      "#priceblock_ourprice",
      ".priceToPay .a-offscreen",
      ".apexPriceToPay .a-offscreen",
      ".reinventPricePriceToPayMargin .a-offscreen",
      "#corePriceDisplay_desktop_feature_div .priceToPay .a-offscreen",
      "#corePrice_feature_div .priceToPay .a-offscreen",
    ];

    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      const value = parsePriceFromText(text);
      if (value !== null && value > 0) {
        return value;
      }
    }

    const candidates = [];
    $(
      "#corePriceDisplay_desktop_feature_div .a-price, #corePrice_feature_div .a-price, .priceToPay, .apexPriceToPay"
    ).each((_, el) => {
      const text = $(el).text().trim();
      const value = parsePriceFromText(text);
      if (value !== null && value > 0) {
        candidates.push(value);
      }
    });

    if (candidates.length) {
      return Math.min(...candidates);
    }

    return null;
  } catch {
    console.log(`Erro ao buscar preço Amazon: ${url}`);
    return null;
  }
}

async function processProduct(product, existingPrices, prices, counters) {
  const productId = product.id;
  const mlLink = product.affiliate?.mercadoLivre || "";
  const amazonLink = product.affiliate?.amazon || "";

  const previous = existingPrices[productId] || {};

  let mlPrice = previous.mercadoLivre ?? null;
  let amazonPrice = previous.amazon ?? null;

  try {
    const [fetchedMlPrice, fetchedAmazonPrice] = await Promise.all([
      mlLink ? getMercadoLivrePrice(mlLink, productId) : Promise.resolve(null),
      amazonLink ? getAmazonPrice(amazonLink) : Promise.resolve(null),
    ]);

    if (fetchedMlPrice !== null) {
      mlPrice = fetchedMlPrice;
    }

    if (fetchedAmazonPrice !== null) {
      amazonPrice = fetchedAmazonPrice;
    }
  } catch {
    // mantém o fallback anterior
  }

  prices[productId] = {
    mercadoLivre: mlPrice,
    amazon: amazonPrice,
    updatedAt: new Date().toISOString(),
  };

  counters.done += 1;
  writePrices(prices);

  console.log(
    `[${counters.done}/${counters.total}] ${productId} -> ML: ${mlPrice} | Amazon: ${amazonPrice}`
  );

  await sleep(BETWEEN_PRODUCTS_DELAY_MS);
}

async function runPool(items, worker, concurrency) {
  let index = 0;

  async function runner() {
    while (true) {
      const currentIndex = index;
      index += 1;

      if (currentIndex >= items.length) {
        return;
      }

      await worker(items[currentIndex], currentIndex);
    }
  }

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => runner());
  await Promise.all(runners);
}

async function updatePrices() {
  const existingPrices = readExistingPrices();
  const prices = { ...existingPrices };

  const filteredProducts = products.filter((product) => {
    if (TEST_ONLY_IDS.length) {
      return TEST_ONLY_IDS.includes(product.id);
    }

    if (TEST_PREFIXES.length) {
      return TEST_PREFIXES.some((prefix) => product.id.startsWith(prefix));
    }

    return true;
  });

  const counters = {
    done: 0,
    total: filteredProducts.length,
  };

  console.log(`Iniciando atualização de ${filteredProducts.length} produtos...`);
  console.log(`Concorrência: ${CONCURRENCY}`);
  console.log(`Modo teste ativo. Prefixos: ${TEST_PREFIXES.join(", ") || "nenhum"}`);
  if (TEST_ONLY_IDS.length) {
    console.log(`Modo teste por IDs: ${TEST_ONLY_IDS.join(", ")}`);
  }

  if (!filteredProducts.length) {
    console.log("Nenhum produto encontrado para o filtro de teste.");
    return;
  }

  try {
    await runPool(
      filteredProducts,
      async (product) => {
        await processProduct(product, existingPrices, prices, counters);
      },
      CONCURRENCY
    );

    writePrices(prices);
    console.log("prices.json atualizado com sucesso.");
  } finally {
    await closeBrowser();
  }
}

updatePrices().catch(async (error) => {
  console.error("Erro geral na atualização de preços:", error);
  await closeBrowser();
  process.exitCode = 1;
});
