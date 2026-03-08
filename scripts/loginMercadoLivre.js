import { chromium } from "playwright";
import fs from "fs";

async function login() {
  const browser = await chromium.launch({ headless: false });

  const context = await browser.newContext();

  const page = await context.newPage();

  console.log("Abrindo Mercado Livre...");

  await page.goto("https://www.mercadolivre.com.br");

  console.log("Faça login manualmente.");
  console.log("Depois pressione ENTER no terminal.");

  await new Promise((resolve) => process.stdin.once("data", resolve));

  await context.storageState({ path: "ml-session.json" });

  console.log("Sessão salva em ml-session.json");

  await browser.close();
}

login();