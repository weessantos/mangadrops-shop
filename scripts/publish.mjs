import { execSync } from "node:child_process";

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

const msg = process.argv.slice(2).join(" ").trim() || "update";

try {

  // checa status
  run("git status");

  // build local (só para validar que o site compila)
  run("npm run build");

  // commit mudanças
  run("git add .");

  try {
    run(`git commit -m "${msg.replaceAll('"', '\\"')}"`);
  } catch {
    console.log("ℹ️ Nenhuma mudança para commitar.");
  }

  // push para main
  run("git push origin main");

  console.log(`
🚀 Código enviado para a main!

GitHub Actions irá agora:
• atualizar o site
• rodar o build
• fazer o deploy automático
`);

} catch (e) {
  console.error("\n❌ Falhou. Veja o erro acima.");
  process.exit(1);
}