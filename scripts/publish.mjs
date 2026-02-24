// scripts/publish.mjs
import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

const msg = process.argv.slice(2).join(" ").trim() || "deploy";

try {
  // checa se tem alterações
  run("git status");

  // build
  run("npm run build");

  // commit/push (se tiver mudanças)
  // (git commit falha se não tiver nada — por isso o try/catch)
  run("git add .");
  try {
    run(`git commit -m "${msg.replaceAll('"', '\\"')}"`);
  } catch {
    console.log("ℹ️ Nenhuma mudança pra commitar (seguindo pro deploy).");
  }

  run("git push");

  // deploy (GitHub Pages via gh-pages)
  run("npm run deploy");

  console.log("\n✅ Publicado com sucesso!");
} catch (e) {
  console.error("\n❌ Falhou. Veja o erro acima.");
  process.exit(1);
}