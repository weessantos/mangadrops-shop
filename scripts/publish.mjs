import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

const msg = process.argv.slice(2).join(" ").trim() || "update";

try {
  run("git status");
  run("git add -A");

  try {
    run(`git commit -m "${msg.replaceAll('"', '\\"')}"`);
  } catch {
    console.log("ℹ️ Nenhuma mudança para commitar.");
  }

  run("git pull --rebase origin main");
  run("git push origin main");

  console.log(`
🚀 Código enviado para a main!

Fluxo final:
• código enviado
• GitHub Actions atualizará preços
• GitHub Actions fará o build
• GitHub Actions publicará o site
`);
} catch {
  console.error("\n❌ Falhou. Veja o erro acima.");
  process.exit(1);
}